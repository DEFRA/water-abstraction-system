'use strict'

/**
 * Process the billing accounts for a given billing period and creates their annual two-part tariff bills
 * @module ProcessBillingPeriodService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const DetermineMinimumChargeService = require('../determine-minimum-charge.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')
const GenerateTwoPartTariffTransactionService = require('../generate-two-part-tariff-transaction.service.js')
const SendTransactionsService = require('../send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

const BillingConfig = require('../../../../config/billing.config.js')

/**
 * Process the billing accounts for a given billing period and creates their annual two-part tariff bills
 *
 * @param {module:BillRunModel} billRun - The two-part tariff annual bill run we need to process
 * @param {object} billingPeriod - An object representing the financial year the bills will be for
 * @param {module:BillingAccountModel[]} billingAccounts - The billing accounts to create bills for
 *
 * @returns {Promise<boolean>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go(billRun, billingPeriod, billingAccounts) {
  let billRunIsPopulated = false

  if (billingAccounts.length === 0) {
    return billRunIsPopulated
  }

  // We set the batch size and number of billing accounts here rather than determine them for every iteration of the
  // loop. It's a very minor nod towards performance.
  const batchSize = BillingConfig.annual.batchSize
  const billingAccountsCount = billingAccounts.length

  // Loop through the billing accounts to be processed by the size of the batch. For example, if we have 100 billing
  // accounts to process and the batch size is 10, we'll make 10 iterations of the loop
  for (let i = 0; i < billingAccountsCount; i += batchSize) {
    // Use slice(start, end) to extract the next batch of billing accounts to process. For example, if we have 100
    // billing accounts, a batch size of 10 then
    //
    // - 1st pass: slice(0, 10) will return billingAccounts[0] to billingAccounts[9]
    // - 2nd pass: slice(10, 20) will return billingAccounts[10] to billingAccounts[19]
    //
    // Both the start and end params are zero-based indexes for the array being sliced. The bit that might confuse is
    // end is not inclusive!
    const accountsToProcess = billingAccounts.slice(i, i + batchSize)

    // NOTE: we purposefully loop through each billing account in the batch without awaiting them to be processed. This
    // is for performance purposes. If our batch size is 10 we'll start processing one after the other. We then wait for
    // all 10 to complete. The overall process time will only be that of the one that takes the longest. If we await
    // instead the overall time will be the sum of the time to process each one.
    const processes = accountsToProcess.map((accountToProcess) => {
      return _processBillingAccount(accountToProcess, billRun, billingPeriod)
    })

    // _processBillingAccount() will return true (bill was created) else false (no bill created) for each billing
    // account processed. Promise.all() will return these results as an array. Only one of them has to be true for us to
    // mark the bill run as populated. The complication is we're not doing this once but multiple times as we iterate
    // the billing accounts. As soon as we have flagged the bill run as populated we can stop checking. And TBH, unlike
    // supplementary it is extremely unlikely an annual bill run would generate no bills. But we play it safe and don't
    // make that assumption.
    const results = await Promise.all(processes)

    if (!billRunIsPopulated) {
      billRunIsPopulated = results.some((result) => {
        return result
      })
    }
  }

  return billRunIsPopulated
}

/**
 * Create the bill licence and transaction records for a bill
 *
 * For each billing account we need to create a bill (1-to-1). Linked to the bill will be multiple charge versions
 * which is what we actually use to calculate a bill. A charge version can have multiple charge references and for each
 * one we need to generate a transaction line.
 *
 * The complication is we group transactions by licence (via the bill licence) not charge version. So, as we iterate
 * the charge versions we have to determine if its for a licence that we have already generated a bill licence for, or
 * we have to create a new one.
 *
 * @private
 */
async function _createBillLicencesAndTransactions(billId, billingAccount, billRunExternalId, billingPeriod) {
  const allBillLicences = []
  const transactions = []

  for (const chargeVersion of billingAccount.chargeVersions) {
    const billLicence = _findOrCreateBillLicence(allBillLicences, chargeVersion.licence, billId)

    const createdTransactions = await _createTransactions(
      billLicence.id,
      billingPeriod,
      chargeVersion,
      billRunExternalId,
      billingAccount.accountNumber
    )

    if (createdTransactions.length > 0) {
      billLicence.billable = true
      transactions.push(...createdTransactions)
    }
  }

  const billLicences = _extractBillableLicences(allBillLicences)

  return { billLicences, transactions }
}

/**
 * Handles generating the transaction data for a given charge version and then sending it to the Charging Module API.
 *
 * @private
 */
async function _createTransactions(billLicenceId, billingPeriod, chargeVersion, billRunExternalId, accountNumber) {
  const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

  if (!chargePeriod.startDate) {
    return []
  }

  const generatedTransactions = _generateTransactionData(billLicenceId, chargePeriod, chargeVersion)

  if (generatedTransactions.length === 0) {
    return []
  }

  return SendTransactionsService.go(generatedTransactions, billRunExternalId, accountNumber, chargeVersion.licence)
}

/**
 * Intended to be used in conjunction with _createBillLicencesAndTransactions() it extracts only those bill licences
 * where we generated transactions. This avoids us persisting a bill licence record with no transaction records.
 *
 * A billing account can be linked to multiple licences but not all of them may be billable. We add a flag to each
 * one that denotes if transactions were generated so we can easily filter the billable ones out. But we also need
 * to remove that flag because it doesn't exist in the DB and will cause issues if we try and persist the object.
 *
 * @private
 */
function _extractBillableLicences(allBillLicences) {
  const billableBillLicences = []

  allBillLicences.forEach((billLicence) => {
    const { id, billId, licenceId, licenceRef, billable } = billLicence

    if (billable) {
      billableBillLicences.push({ id, billId, licenceId, licenceRef })
    }
  })

  return billableBillLicences
}

/**
 * Use to either find or create the bill licence for a given bill (billing account) and licence
 *
 * For each billing account being processed the engine will create a bill. But the transactions within a bill are
 * grouped by licence because the details of the licence will effect the charge against the transactions.
 *
 * So, transactions are linked to a bill by a 'bill licence' record. Things are further complicated by the fact we don't
 * directly work with the licences against a billing account. The link is via charge versions, and more than one charge
 * version can link to the same licence.
 *
 * > The information needed for billing is held in charge versions and their associated records. A licence will have at
 * > least one of these but may have more should changes have been made, for example, a change in the amount that can be
 * > abstracted. It's the charge version that is directly linked to the billing account, not the licence.
 *
 * Because we're processing the charge versions for a billing account the same licence might appear more than once. This
 * means we need to find the existing bill licence record or if one doesn't exist create it.
 *
 * @param {object[]} billLicences - The existing bill licences created for the bill being generated
 * @param {object} licence - the licence we're looking for an existing bill licence record
 * @param {string} billId - the ID of the bill we're creating
 *
 * @return {object} returns either an existing bill licence or a new one for the licence and bill being generated
 *
 * @private
 */
function _findOrCreateBillLicence(billLicences, licence, billId) {
  const { id: licenceId, licenceRef } = licence

  let billLicence = billLicences.find((existingBillLicence) => {
    return existingBillLicence.licenceId === licenceId
  })

  if (!billLicence) {
    billLicence = {
      id: generateUUID(),
      billId,
      licenceId,
      licenceRef,
      billable: false
    }

    billLicences.push(billLicence)
  }

  return billLicence
}

/**
 * Generate the transaction data for a charge version
 *
 * For each charge reference linked to the charge version we have to generate a
 * transaction record. One of the things we need to know is if the charge version is the first charge on a new licence.
 * This information needs to be passed to the Charging Module API as it affects the calculation.
 *
 * This function iterates the charge references generating a transaction for each one.
 *
 * @private
 */
function _generateTransactionData(billLicenceId, chargePeriod, chargeVersion) {
  try {
    const firstChargeOnNewLicence = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

    const transactions = []

    chargeVersion.chargeReferences.forEach((chargeReference) => {
      const transaction = GenerateTwoPartTariffTransactionService.go(
        billLicenceId,
        chargeReference,
        chargePeriod,
        firstChargeOnNewLicence,
        chargeVersion.licence.waterUndertaker
      )

      if (transaction) {
        transactions.push(transaction)
      }
    })

    return transactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToPrepareTransactions)
  }
}

/**
 * Processes the billing account
 *
 * We create a bill object that will eventually be persisted for the billing account. We then call
 * `_createBillLicencesAndTransactions()` which handles generating the bill licences and transactions that will form
 * our bill.
 *
 * Once everything has been generated we persist the results to the DB.
 *
 * @private
 */
async function _processBillingAccount(billingAccount, billRun, billingPeriod) {
  const { id: billingAccountId, accountNumber } = billingAccount
  const { id: billRunId, externalId: billRunExternalId } = billRun

  const bill = {
    id: generateUUID(),
    accountNumber,
    address: {}, // Address is set to an empty object for SROC billing invoices
    billingAccountId,
    billRunId,
    credit: false,
    financialYearEnding: billingPeriod.endDate.getFullYear()
  }

  const billData = await _createBillLicencesAndTransactions(bill.id, billingAccount, billRunExternalId, billingPeriod)

  const { billLicences, transactions } = billData

  // No transactions were generated so there is nothing to bill. Do not persist anything!
  if (transactions.length === 0) {
    return false
  }

  return _persistBillData(bill, billLicences, transactions)
}

async function _persistBillData(bill, billLicences, transactions) {
  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)

  return true
}

module.exports = {
  go
}
