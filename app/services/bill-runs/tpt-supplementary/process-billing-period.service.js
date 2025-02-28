'use strict'

/**
 * Process the billing accounts for a given billing period and creates their supplementary two-part tariff bills
 * @module ProcessBillingPeriodService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const DetermineMinimumChargeService = require('../determine-minimum-charge.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')
const GenerateTransactionService = require('./generate-transaction.service.js')
const ProcessSupplementaryTransactionsService = require('../process-supplementary-transactions.service.js')
const SendTransactionsService = require('../send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

const BillingConfig = require('../../../../config/billing.config.js')

/**
 * Process the billing accounts for a given billing period and creates their supplementary two-part tariff bills
 *
 * @param {module:BillRunModel} billRun - The two-part tariff supplementary bill run we need to process
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
    // the billing accounts. As soon as we have flagged the bill run as populated we can stop checking.
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
 * Generate the bill licence and transaction records for a bill, then cleanse them so only billable remains
 *
 * For each billing account we need to create a bill (1-to-1). Linked to the billing account will be multiple charge
 * versions which is what we actually use to calculate a bill. A charge version can have multiple charge references and
 * for each one we need to generate a transaction line.
 *
 * The complication is we group transactions by licence (via the bill licence), not charge version. So, as we iterate
 * the charge versions we have to determine if its for a licence that we have already generated a bill licence for, or
 * if we have to create a new one.
 *
 * Once we have generated the bill licences and the transactions against them, we then need to 'cleanse' them for
 * billing.
 *
 * - Those with no generated lines are simply removed (most likely some has ended the licence so the charge versions
 * used to generate the transactions no longer applied)
 * - Those which when the generated lines are 'paired' to previously billed lines results in nothing needing to be
 * billed
 *
 * From those that remain, we extract the bill licences and transactions to allow us to 'batch' the persist queries
 * we fire at the DB.
 *
 * @private
 */
async function _generateBillLicencesAndTransactions(billId, billingAccount, billingPeriod) {
  const allBillLicences = []

  for (const chargeVersion of billingAccount.chargeVersions) {
    const billLicence = _findOrCreateBillLicence(allBillLicences, chargeVersion.licence, billId)

    const generatedTransactions = await _generateTransactions(billLicence.id, billingPeriod, chargeVersion)

    billLicence.transactions.push(...generatedTransactions)
  }

  return allBillLicences
}

async function _processBillLicences(billLicences, billingAccountId, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()
  const cleansedBillLicences = []

  for (const billLicence of billLicences) {
    if (billLicence.transactions.length === 0) {
      continue
    }

    const { id: billLicenceId, licence, transactions } = billLicence
    const processedTransactions = await ProcessSupplementaryTransactionsService.go(
      transactions,
      billLicenceId,
      billingAccountId,
      licence.id,
      financialYearEnding
    )

    if (processedTransactions.length === 0) {
      continue
    }

    billLicence.transactions = processedTransactions

    cleansedBillLicences.push(billLicence)
  }

  return cleansedBillLicences
}

/**
 * Intended to be used in conjunction with _generateBillLicencesAndTransactions() it extracts only those bill licences
 * where
 *
 * - we generated transactions
 * - after comparing them to previously billed transactions a difference is found requiring us to generate a bill
 *
 * Along with the bill licences we extract the transactions
 * we generated transactions. This avoids us persisting a bill licence record with no transaction records.
 *
 * A billing account can be linked to multiple licences but not all of them may be billable. We add a flag to each
 * one that denotes if transactions were generated so we can easily filter the billable ones out. But we also need
 * to remove that flag because it doesn't exist in the DB and will cause issues if we try and persist the object.
 *
 * @private
 */

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
  let billLicence = billLicences.find((existingBillLicence) => {
    return existingBillLicence.licence.id === licence.id
  })

  if (!billLicence) {
    billLicence = {
      id: generateUUID(),
      billId,
      licence,
      transactions: []
    }

    billLicences.push(billLicence)
  }

  return billLicence
}

/**
 * Generate the transaction(s) for a charge version
 *
 * For each charge reference linked to the charge version we have to generate a transaction record. One of the things we
 * need to know is if the charge version is the first charge on a new licence. This information needs to be passed to
 * the Charging Module API as it affects the calculation.
 *
 * This function iterates the charge references generating transaction(s) for each one.
 *
 * @private
 */
async function _generateTransactions(billLicenceId, billingPeriod, chargeVersion) {
  try {
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    // Guard clause against invalid charge periods, for example, a licence 'ends' before the charge version starts
    if (!chargePeriod.startDate) {
      return []
    }

    const firstChargeOnNewLicence = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

    const transactions = []

    chargeVersion.chargeReferences.forEach((chargeReference) => {
      const transaction = GenerateTransactionService.go(
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

  const allBillLicences = await _generateBillLicencesAndTransactions(bill.id, billingAccount, billingPeriod)
  const processedBillLicences = await _processBillLicences(allBillLicences, billingAccount.id, billingPeriod)

  if (processedBillLicences.length === 0) {
    return false
  }

  return _persistGeneratedData(bill, processedBillLicences, billRunExternalId, billingAccount.accountNumber)
}

async function _persistGeneratedData(bill, processedBillLicences, billRunExternalId, accountNumber) {
  const billLicences = []
  const transactions = []

  for (const processedBillLicence of processedBillLicences) {
    const { billId, id, licence, transactions: processedTransactions } = processedBillLicence
    const sentTransactions = await SendTransactionsService.go(
      processedTransactions,
      billRunExternalId,
      accountNumber,
      licence
    )

    billLicences.push({ billId, id, licenceId: licence.id, licenceRef: licence.licenceRef })
    transactions.push(...sentTransactions)
  }

  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)

  return true
}

module.exports = {
  go
}
