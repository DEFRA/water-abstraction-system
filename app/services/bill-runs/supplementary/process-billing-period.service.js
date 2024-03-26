'use strict'

/**
 * Process the billing accounts for a given billing period and creates their supplementary bills
 * @module ProcessBillingPeriodService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const DetermineMinimumChargeService = require('../determine-minimum-charge.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')
const GenerateTransactionsService = require('../generate-transactions.service.js')
const ProcessTransactionsService = require('./process-transactions.service.js')
const SendTransactionsService = require('../send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

const BillingConfig = require('../../../../config/billing.config.js')

/**
 * Process the billing accounts for a given billing period and creates their supplementary bills
 *
 * @param {module:BillRunModel} billRun - The newly created bill run we need to process
 * @param {Object} billingPeriod - An object representing the financial year the bills will be for
 * @param {module:ChargeVersionModel[]} billingAccounts - The billing accounts to create bills for
 *
 * @returns {Promise<Object>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go (billRun, billingPeriod, billingAccounts) {
  let billRunIsPopulated = false

  if (billingAccounts.length === 0) {
    return billRunIsPopulated
  }

  // We set the batch size and number of billing accounts here rather than determine them for every iteration of the
  // loop. It's a very minor node towards performance.
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

    const results = await Promise.all(processes)
    if (!billRunIsPopulated) {
      billRunIsPopulated = results.some((result) => result)
    }
  }

  return billRunIsPopulated
}

async function _createBillLicencesAndTransactions (billId, billingAccount, billRunExternalId, billingPeriod) {
  const allBillLicences = []
  const transactions = []

  for (const chargeVersion of billingAccount.chargeVersions) {
    const billLicence = _findOrCreateBillLicence(allBillLicences, chargeVersion.licence, billId)

    const createdTransactions = await _createTransactions(
      billingAccount,
      billLicence,
      billingPeriod,
      chargeVersion,
      billRunExternalId
    )

    if (createdTransactions.length > 0) {
      billLicence.billable = true
      transactions.push(...createdTransactions)
    }
  }

  const billLicences = _extractBillableLicences(allBillLicences)

  return { billLicences, transactions }
}

async function _createTransactions (billingAccount, billLicence, billingPeriod, chargeVersion, billRunExternalId) {
  const { id: billingAccountId, accountNumber } = billingAccount
  const { id: billLicenceId } = billLicence

  const generatedTransactions = _generateTransactionData(billLicenceId, billingPeriod, chargeVersion)
  const cleansedTransactions = await ProcessTransactionsService.go(generatedTransactions, billingAccountId, billLicence, billingPeriod)

  if (cleansedTransactions.length === 0) {
    return []
  }

  return SendTransactionsService.go(cleansedTransactions, billRunExternalId, accountNumber, chargeVersion.licence)
}

function _extractBillableLicences (allBillLicences) {
  const billableBillLicences = []

  allBillLicences.forEach((billLicence) => {
    const { id, billId, licenceId, licenceRef, billable } = billLicence
    if (billable) {
      billableBillLicences.push({ id, billId, licenceId, licenceRef })
    }
  })

  return billableBillLicences
}

function _findOrCreateBillLicence (billLicences, licence, billId) {
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

function _generateTransactionData (billLicenceId, billingPeriod, chargeVersion) {
  try {
    // We only need to calculate the transactions for charge versions with a status of `current` (APPROVED). We still
    // check and possibly return previous transactions when ProcessTransactionsService is called next in
    // _createTransactions()
    if (chargeVersion.status !== 'current') {
      return []
    }

    // NOTE: There is a chance of creating an empty (invalid) chargePeriod. For example, the charge version has an
    // abstraction period of 1 Aug to 30 Sept but was revoked on 15 July. DetermineChargePeriodService will determine
    // there is no charge period in this scenario.
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    if (!chargePeriod.startDate) {
      return []
    }

    const firstChargeOnNewLicence = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)

    // We use flatMap as GenerateTransactionsService returns an array of transactions (depending on if a compensation
    // transaction is also created) and we need to return a 'flat' array of all transactions
    const transactions = chargeVersion.chargeReferences.flatMap((chargeReference) => {
      return GenerateTransactionsService.go(
        billLicenceId,
        chargeReference,
        billingPeriod,
        chargePeriod,
        firstChargeOnNewLicence,
        chargeVersion.licence.waterUndertaker
      )
    })

    return transactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToPrepareTransactions)
  }
}

async function _persistBillData (bill, billLicences, transactions) {
  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)

  return true
}

async function _processBillingAccount (billingAccount, billRun, billingPeriod) {
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

module.exports = {
  go
}
