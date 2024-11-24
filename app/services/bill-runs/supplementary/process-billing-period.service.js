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
const DetermineMinimumChargeService = require('../determine-minimum-charge.service.js')
const GenerateTransactionsService = require('../generate-transactions.service.js')
const PreGenerateBillingDataService = require('./pre-generate-billing-data.service.js')
const ProcessTransactionsService = require('./process-transactions.service.js')
const SendTransactionsService = require('../send-transactions.service.js')
const TransactionModel = require('../../../models/transaction.model.js')

/**
 * Creates the bills and transactions in both WRLS and the Charging Module API
 *
 * @param {module:BillRunModel} billRun - The newly created bill run we need to process
 * @param {object} billingPeriod - An object representing the financial year the transactions are for
 * @param {module:ChargeVersionModel[]} chargeVersions - The charge versions to create transactions for
 *
 * @returns {boolean} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go(billRun, billingPeriod, chargeVersions) {
  if (chargeVersions.length === 0) {
    return false
  }

  const preGeneratedData = await PreGenerateBillingDataService.go(chargeVersions, billRun.id, billingPeriod)

  const billingData = _buildBillingDataWithTransactions(chargeVersions, preGeneratedData, billingPeriod)
  const dataToPersist = await _buildDataToPersist(billingData, billingPeriod, billRun.externalId)

  const didWePersistData = await _persistData(dataToPersist)

  return didWePersistData
}

/**
 * Iterates over the populated billing data and builds an object of data to be persisted. This process includes sending
 * "create transaction" requests to the Charging Module as this data is needed to fully create our transaction records
 *
 * @private
 */
async function _buildDataToPersist(billingData, billingPeriod, billRunExternalId) {
  const dataToPersist = {
    transactions: [],
    // We use a set as this won't create an additional entry if we try to add a billing invoice already in it
    bills: new Set(),
    billLicences: []
  }

  for (const currentBillingData of Object.values(billingData)) {
    const cleansedTransactions = await _cleanseTransactions(currentBillingData, billingPeriod)

    if (cleansedTransactions.length !== 0) {
      const transactions = await SendTransactionsService.go(
        cleansedTransactions,
        billRunExternalId,
        currentBillingData.bill.accountNumber,
        currentBillingData.licence
      )

      dataToPersist.transactions.push(...transactions)
      // Note that sets use add rather than push
      dataToPersist.bills.add(currentBillingData.bill)
      dataToPersist.billLicences.push(currentBillingData.billLicence)
    }
  }

  return {
    ...dataToPersist,
    // We revert the bills set to an array so we can handle it normally later
    bills: [...dataToPersist.bills]
  }
}

/**
 * Processes each charge version and and returns an object where each key is a bill id which exists in one or
 * more charge versions and the key's value is an object containing the associated licence, bill and bill
 * licence, along with any required transactions, eg:
 *
 * ```javascript
 * {
 *   'bill-licence-id-1': {
 *     billLicence: '...',     // instance of the bill licence
 *     licence: '...',         // instance of the licence for this bill licence
 *     bill: '...',            // instance of the bill for this bill licence
 *     transactions: []        // array of calculated transactions for this bill licence
 *   },
 *   'bill-licence-id-2': {
 *     // Same object structure as above
 *   }
 * }
 * ```
 *
 * @private
 */
function _buildBillingDataWithTransactions(chargeVersions, preGeneratedData, billingPeriod) {
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
      acc[billLicenceId] = _initialBillingData(chargeVersion.licence, bill, billLicence)
    }

    // We only need to calculate the transactions for charge versions with a status of `current` (APPROVED).
    // We fetch the previous transactions for `superseded` (REPLACED) charge versions later in the process
    if (chargeVersion.status === 'current') {
      const calculatedTransactions = _generateCalculatedTransactions(billLicenceId, billingPeriod, chargeVersion)

      acc[billLicenceId].calculatedTransactions.push(...calculatedTransactions)
    }

    return acc
  }, {})
}

/**
 * Persists the transaction, bill and bill licence records in the db
 *
 * @private
 */
async function _persistData(dataToPersist) {
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

function _retrievePreGeneratedData(preGeneratedData, billingAccountId, licence) {
  const { bills, billLicences } = preGeneratedData

  const bill = bills[billingAccountId]

  const billLicenceKey = _billLicenceKey(bill.id, licence.id)
  const billLicence = billLicences[billLicenceKey]

  return { bill, billLicence }
}

function _billLicenceKey(billId, licenceId) {
  return `${billId}-${licenceId}`
}

function _initialBillingData(licence, bill, billLicence) {
  return {
    licence,
    bill,
    billLicence,
    calculatedTransactions: []
  }
}

async function _cleanseTransactions(currentBillingData, billingPeriod) {
  // Guard clause which is most likely to hit in the event that no charge versions were 'fetched' to be billed in
  // the first place
  if (!currentBillingData.bill) {
    return []
  }

  const cleansedTransactions = await ProcessTransactionsService.go(
    currentBillingData.calculatedTransactions,
    currentBillingData.bill.billingAccountId,
    currentBillingData.billLicence,
    billingPeriod
  )

  return cleansedTransactions
}

function _generateCalculatedTransactions(billLicenceId, billingPeriod, chargeVersion) {
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
