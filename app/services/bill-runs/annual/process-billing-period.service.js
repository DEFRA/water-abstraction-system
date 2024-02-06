'use strict'

/**
 * Processes the charge versions for a given billing period
 * @module ProcessBillingPeriodService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const BillModel = require('../../../models/bill.model.js')
const BillLicenceModel = require('../../../models/bill-licence.model.js')
const DetermineChargePeriodService = require('../determine-charge-period.service.js')
const DetermineMinimumChargeService = require('../supplementary/determine-minimum-charge.service.js')
const { generateUUID } = require('../../../lib/general.lib.js')
const GenerateTransactionsService = require('./generate-transactions.service.js')
const SendTransactionsService = require('./send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

const BillingConfig = require('../../../../config/billing.config.js')

/**
 * Creates the bills and transactions in both WRLS and the Charging Module API
 *
 * @param {module:BillRunModel} billRun - The newly created bill run we need to process
 * @param {Object} billingPeriod - An object representing the financial year the transactions are for
 * @param {module:BillingAccountModel[]} billingAccounts - The billing accounts to create bills for
 *
 * @returns {Promise<Boolean>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go (billRun, billingPeriod, billingAccounts) {
  if (billingAccounts.length === 0) {
    return false
  }

  const batchSize = BillingConfig.annual.batchSize
  const billingAccountsCount = billingAccounts.length
  for (let i = 0; i < billingAccountsCount; i += batchSize) {
    const accountsToProcess = billingAccounts.slice(i, i + batchSize)

    const processes = accountsToProcess.map((accountToProcess) => {
      return _processBillingAccount(accountToProcess, billRun, billingPeriod)
    })

    await Promise.all(processes)
  }

  return true
}

async function _processBillingAccount (billingAccount, billRun, billingPeriod) {
  const { id: billingAccountId, accountNumber } = billingAccount
  const { id: billRunId, externalId: billRunExternalId } = billRun

  const billData = await _createBillLicencesAndTransactions(billingAccount, billRunExternalId, billingPeriod)

  const { billId, billLicences, transactions } = billData

  const bill = {
    id: billId,
    accountNumber,
    address: {}, // Address is set to an empty object for SROC billing invoices
    billingAccountId,
    billRunId,
    credit: false,
    financialYearEnding: billingPeriod.endDate.getFullYear()
  }

  return _persistBillData(bill, billLicences, transactions)
}

async function _createBillLicencesAndTransactions (billingAccount, billRunExternalId, billingPeriod) {
  const billId = generateUUID()
  const billLicences = []
  const transactions = []

  const { accountNumber } = billingAccount

  for (const chargeVersion of billingAccount.chargeVersions) {
    const { id: licenceId, licenceRef } = chargeVersion.licence

    let billLicence = billLicences.find((billLicence) => {
      return billLicence.licenceId === licenceId
    })

    if (!billLicence) {
      billLicence = {
        id: generateUUID(),
        billId,
        licenceId,
        licenceRef
      }

      billLicences.push(billLicence)
    }

    const generatedTransactions = _generateTransactions(billLicence.id, billingPeriod, chargeVersion)
    const sentTransactions = await SendTransactionsService.go(
      generatedTransactions,
      billRunExternalId,
      accountNumber,
      chargeVersion.licence
    )

    transactions.push(...sentTransactions)
  }

  return { billId, billLicences, transactions }
}

async function _persistBillData (bill, billLicences, transactions) {
  await BillModel.query().insert(bill)
  await BillLicenceModel.query().insert(billLicences)
  await TransactionModel.query().insert(transactions)
}

function _generateTransactions (billLicenceId, billingPeriod, chargeVersion) {
  try {
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    if (!chargePeriod.startDate) {
      return []
    }

    const newLicence = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)
    const waterUndertaker = chargeVersion.licence.waterUndertaker

    // We use flatMap as GenerateTransactionsService returns an array of transactions
    const transactions = chargeVersion.chargeReferences.flatMap((chargeReference) => {
      return GenerateTransactionsService.go(
        billLicenceId,
        chargeReference,
        billingPeriod,
        chargePeriod,
        newLicence,
        waterUndertaker
      )
    })

    return transactions
  } catch (error) {
    throw new BillRunError(error, BillRunModel.errorCodes.failedToPrepareTransactions)
  }
}

module.exports = {
  go
}
