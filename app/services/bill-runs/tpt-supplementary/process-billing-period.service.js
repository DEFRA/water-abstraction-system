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
const FetchPreviousTransactionsService = require('../fetch-previous-transactions.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')
const GenerateTwoPartTariffTransactionService = require('../generate-two-part-tariff-transaction.service.js')
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
 * Generate the bill licence and transaction records for a bill
 *
 * For each billing account we need to create a bill (1-to-1). Linked to the billing account will be multiple charge
 * versions which is what we actually use to calculate a bill. A charge version can have multiple charge references and
 * for each one we need to generate a transaction line.
 *
 * The complication is we group transactions by licence (via the bill licence), not charge version. So, as we iterate
 * the charge versions we have to determine if its for a licence that we have already generated a bill licence for, or
 * if we have to create a new one.
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

/**
 * Generate the transaction(s) for a charge version
 *
 * Two kinds of charge version are processed by this function.
 *
 * The first will have charge references that in turn will have charge elements and review records. These are those the
 * match and allocate engine found and processed and that the user has reviewed. They are in the supplementary because
 * the user has made a change to the licence (edited a return, added a new two-part tariff charge version etc) that
 * doesn't prevent match & allocate from finding it.
 *
 * The second kind is where match & allocate hasn't processed the licence and its charge versions. This is because the
 * user has made a change that means match & allocate cannot see it. For example, adding a non-chargeable charge
 * version, or adding a new charge version but removing the two-part tariff agreement from it. These won't have charge
 * references.
 *
 * > This is because in FetchBillingAccounts we INNER JOIN the charge references to `review_charge_references` i.e. we
 * > only 'generate' transactions for things that have gone through match and allocate.
 *
 * The first kind we need to generate new transaction lines with the intention of creating new debit transactions. The
 * second we only need to help look for any previous transactions that might need to be credited.
 *
 * @private
 */
async function _generateTransactions(billLicenceId, billingPeriod, chargeVersion) {
  try {
    if (chargeVersion.chargeReferences.length === 0) {
      return []
    }

    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    // Guard clause against invalid charge periods, for example, a licence 'ends' before the charge version starts
    if (!chargePeriod.startDate) {
      return []
    }

    // One of the things we need to know is if the charge version is the first charge on a new licence. This information
    // needs to be passed to the Charging Module API as it affects the calculation.
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
 * `_generateBillLicencesAndTransactions()` which handles generating the candidate bill licences and their transactions.
 *
 * These are 'processed' by `_processBillLicences()` which returns only those which have something to bill.
 *
 * Those bill licences with transactions after processing are then passed to `_persistGeneratedData()`. It first
 * calls the Charging Module API to get the charge value, before persisting the transactions, bill licences and the bill
 * itself to the DB.
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

/**
 * Process the bill licences
 *
 * We loop through each bill licence and check if any transactions were generated. If not we skip it.
 *
 * If there are transactions we call `ProcessSupplementaryTransactionsService.go()` which will pair up newly generated
 * transactions with previously billed ones. If there are no differences (i.e. all transactions have been previously
 * billed) we skip it.
 *
 * Finally, we return an array of the bill licences that have been processed and have transactions that require billing.
 *
 * @private
 */
async function _processBillLicences(billLicences, billingAccountId, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()
  const cleansedBillLicences = []

  for (const billLicence of billLicences) {
    const previousTransactions = await FetchPreviousTransactionsService.go(
      billingAccountId,
      billLicence.licence.id,
      financialYearEnding,
      true
    )

    const processedTransactions = await ProcessSupplementaryTransactionsService.go(
      previousTransactions,
      billLicence.transactions,
      billLicence.id
    )

    if (processedTransactions.length === 0) {
      continue
    }

    billLicence.transactions = processedTransactions

    cleansedBillLicences.push(billLicence)
  }

  return cleansedBillLicences
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
