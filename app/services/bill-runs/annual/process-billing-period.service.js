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
const GenerateTransactionsService = require('../supplementary/generate-transactions.service.js')
const PreGenerateBillingDataService = require('./pre-generate-billing-data.service.js')
const SendTransactionsService = require('./send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

/**
 * Creates the bills and transactions in both WRLS and the Charging Module API
 *
 * @param {module:BillRunModel} billRun The newly created bill run we need to process
 * @param {Object} billingPeriod An object representing the financial year the transactions are for
 * @param {module:ChargeVersionModel[]} chargeVersions The charge versions to create transactions for
 *
 * @returns {Promise<Boolean>} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go (billRun, billingPeriod, chargeVersions) {
  if (chargeVersions.length === 0) {
    return false
  }

  const preGeneratedData = await PreGenerateBillingDataService.go(
    chargeVersions,
    billRun.id,
    billingPeriod
  )

  const billingData = _buildBillingDataWithTransactions(chargeVersions, preGeneratedData, billingPeriod)
  const dataToPersist = await _buildDataToPersist(billingData, billRun.externalId)

  const didWePersistData = await _persistData(dataToPersist)

  return didWePersistData
}

async function _process (preGeneratedBillingData, chargeVersions, billingPeriod) {
  for (const bill of Object.values(preGeneratedBillingData)) {


    const chargeVersionsToProcess = chargeVersions.filter((chargeVersion) => {
      return chargeVersion.billingAccountId === bill.billingAccountId
    })


  }
}

async function _buildDataToPersist (billingData, billRunExternalId) {
  const dataToPersist = {
    transactions: [],
    // We use a set as this won't create an additional entry if we try to add a billing invoice already in it
    bills: new Set(),
    billLicences: []
  }

  for (const currentBillingData of Object.values(billingData)) {
    if (currentBillingData.transactions.length === 0) {
      continue
    }

    await SendTransactionsService.go(
      currentBillingData.licence,
      currentBillingData.bill,
      currentBillingData.billLicence,
      billRunExternalId,
      currentBillingData.transactions
    )

    dataToPersist.transactions.push(...currentBillingData.transactions)
    // NOTE: Set uses add rather than push
    dataToPersist.bills.add(currentBillingData.bill)
    dataToPersist.billLicences.push(currentBillingData.billLicence)
  }

  return {
    ...dataToPersist,
    // We revert the bills set to an array so we can handle it normally later
    bills: [...dataToPersist.bills]
  }
}

function _buildBillingDataWithTransactions (chargeVersions, preGeneratedData, billingPeriod) {
  // We use reduce to build up the object as this allows us to start with an empty object and populate it with each
  // charge version.
  return chargeVersions.reduce((acc, chargeVersion) => {
    const { billLicence, bill } = _retrievePreGeneratedData(
      preGeneratedData,
      chargeVersion.billingAccountId,
      chargeVersion.licence
    )

    const { id: billLicenceId } = billLicence

    if (!acc[billLicenceId]) {
      acc[billLicenceId] = { licence: chargeVersion.licence, bill, billLicence, transactions: [] }
    }

    const transactions = _generateTransactions(billingPeriod, chargeVersion)
    acc[billLicenceId].transactions.push(...transactions)

    return acc
  }, {})
}

async function _persistData (dataToPersist) {
  // If we don't have any transactions to persist then we also won't have any bills or bill licences, so we
  // simply return early
  if (dataToPersist.transactions.length === 0) {
    return false
  }

  await TransactionModel.query().insert(dataToPersist.transactions)
  await BillModel.query().insert(dataToPersist.bills)
  await BillLicenceModel.query().insert(dataToPersist.billLicences)

  return true
}

function _retrievePreGeneratedData (preGeneratedData, billingAccountId, licence) {
  const { bills, billLicences } = preGeneratedData

  const bill = bills[billingAccountId]

  const billLicenceKey = `${bill.id}-${licence.id}`
  const billLicence = billLicences[billLicenceKey]

  return { bill, billLicence }
}

function _generateTransactions (billingPeriod, chargeVersion) {
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
