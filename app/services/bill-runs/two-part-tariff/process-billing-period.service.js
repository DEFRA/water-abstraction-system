'use strict'

/**
 * Process the billing accounts for a given billing period and creates their annual bills
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
const SendTransactionsService = require('../send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

const BillingConfig = require('../../../../config/billing.config.js')

/**
 * Process the billing accounts for a given billing period and creates their annual bills
 *
 * @param {module:BillRunModel} billRun - The newly created bill run we need to process
 * @param {Object} billingPeriod - An object representing the financial year the bills will be for
 * @param {module:BillingAccountModel[]} billingAccounts - The billing accounts to create bills for
 *
 * @returns {Promise<Boolean>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go (billRun, billingPeriod, billingAccounts) {
  let billRunIsPopulated = false

  if (billingAccounts.length === 0) {
    return billRunIsPopulated
  }

  const batchSize = BillingConfig.annual.batchSize
  const billingAccountsCount = billingAccounts.length

  for (let i = 0; i < billingAccountsCount; i += batchSize) {
    const accountsToProcess = billingAccounts.slice(i, i + batchSize)

    const processes = accountsToProcess.map((accountToProcess) => {
      return _processBillingAccount(accountToProcess, billRun, billingPeriod)
    })

    const results = await Promise.all(processes)
    if (!billRunIsPopulated) {
      billRunIsPopulated = results.some((result) => {
        return result
      })
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

async function _createTransactions (billLicenceId, billingPeriod, chargeVersion, billRunExternalId, accountNumber) {
  const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

  if (!chargePeriod.startDate) {
    return []
  }

  const generatedTransactions = _generateTransactionData(billLicenceId, chargePeriod, chargeVersion)

  return SendTransactionsService.go(generatedTransactions, billRunExternalId, accountNumber, chargeVersion.licence)
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

function _generateTransactionData (billLicenceId, chargePeriod, chargeVersion) {
  try {
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

      transactions.push(transaction)
    })

    return transactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToPrepareTransactions)
  }
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

async function _persistBillData (bill, billLicences, transactions) {
  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)

  return true
}

module.exports = {
  go
}
