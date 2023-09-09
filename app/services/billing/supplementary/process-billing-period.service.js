'use strict'

/**
 * Processes the charge versions for a given billing period
 * @module ProcessBillingPeriodService
 */

const BillRunError = require('../../../errors/bill-run.error.js')
const BillRunModel = require('../../../models/water/bill-run.model.js')
const BillingInvoiceModel = require('../../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../../models/water/billing-invoice-licence.model.js')
const BillingTransactionModel = require('../../../models/water/billing-transaction.model.js')
const DetermineChargePeriodService = require('./determine-charge-period.service.js')
const DetermineMinimumChargeService = require('./determine-minimum-charge.service.js')
const GenerateBillingTransactionsService = require('./generate-billing-transactions.service.js')
const PreGenerateBillingDataService = require('./pre-generate-billing-data.service.js')
const ProcessBillingTransactionsService = require('./process-billing-transactions.service.js')
const SendBillingTransactionsService = require('./send-billing-transactions.service.js')

/**
 * Creates the invoices and transactions in both WRLS and the Charging Module API
 *
 * TODO: Currently a placeholder service. Proper implementation is coming
 *
 * @param {module:BillRunModel} billRun The newly created bill run we need to process
 * @param {Object} billingPeriod An object representing the financial year the transactions are for
 * @param {module:ChargeVersionModel[]} chargeVersions The charge versions to create transactions for
 *
 * @returns {Boolean} true if the bill run is not empty (there are transactions to bill) else false
 */
async function go (billRun, billingPeriod, chargeVersions) {
  if (chargeVersions.length === 0) {
    return false
  }

  const preGeneratedData = await PreGenerateBillingDataService.go(
    chargeVersions,
    billRun.billingBatchId,
    billingPeriod
  )

  const billingData = _buildBillingDataWithTransactions(chargeVersions, preGeneratedData, billingPeriod)
  const dataToPersist = await _buildDataToPersist(billingData, billingPeriod, billRun.externalId)

  const didWePersistData = await _persistData(dataToPersist)

  return didWePersistData
}

/**
 * Iterates over the populated billing data and builds an object of data to be persisted. This process includes sending
 * "create transaction" requests to the Charging Module as this data is needed to fully create our transaction records
 */
async function _buildDataToPersist (billingData, billingPeriod, billRunExternalId) {
  const dataToPersist = {
    transactions: [],
    // We use a set as this won't create an additional entry if we try to add a billing invoice already in it
    billingInvoices: new Set(),
    billingInvoiceLicences: []
  }

  for (const currentBillingData of Object.values(billingData)) {
    const cleansedTransactions = await _cleanseTransactions(currentBillingData, billingPeriod)

    if (cleansedTransactions.length !== 0) {
      const billingTransactions = await SendBillingTransactionsService.go(
        currentBillingData.licence,
        currentBillingData.billingInvoice,
        currentBillingData.billingInvoiceLicence,
        billRunExternalId,
        cleansedTransactions,
        billingPeriod
      )

      dataToPersist.transactions.push(...billingTransactions)
      // Note that sets use add rather than push
      dataToPersist.billingInvoices.add(currentBillingData.billingInvoice)
      dataToPersist.billingInvoiceLicences.push(currentBillingData.billingInvoiceLicence)
    }
  }

  return {
    ...dataToPersist,
    // We revert the billingInvoices set to an array so we can handle it normally later
    billingInvoices: [...dataToPersist.billingInvoices]
  }
}

/**
 * Processes each charge version and and returns an object where each key is a billing invoice id which exists in one or
 * more charge versions and the key's value is an object containing the associated licence, billing invoice and billing
 * invoice licence, along with any required transactions, eg:
 *
 * {
 *   'billing-invoice-licence-id-1': {
 *     billingInvoiceLicence: '...',   // instance of the billing invoice licence
 *     licence: '...',                 // instance of the licence for this billing invoice licence
 *     billingInvoice: '...',          // instance of the billing invoice for this billing invoice licence
 *     transactions: []                // array of calculated transactions for this billing invoice licence
 *   },
 *   'billing-invoice-licence-id-2': {
 *     // Same object structure as above
 *   }
 * }
 */
function _buildBillingDataWithTransactions (chargeVersions, preGeneratedData, billingPeriod) {
  // We use reduce to build up the object as this allows us to start with an empty object and populate it with each
  // charge version.
  return chargeVersions.reduce((acc, chargeVersion) => {
    const { billingInvoiceLicence, billingInvoice } = _retrievePreGeneratedData(
      preGeneratedData,
      chargeVersion.invoiceAccountId,
      chargeVersion.licence
    )

    const { billingInvoiceLicenceId } = billingInvoiceLicence

    if (!acc[billingInvoiceLicenceId]) {
      acc[billingInvoiceLicenceId] = _initialBillingData(chargeVersion.licence, billingInvoice, billingInvoiceLicence)
    }

    // We only need to calculate the transactions for charge versions with a status of `current` (APPROVED).
    // We fetch the previous transactions for `superseded` (REPLACED) charge versions later in the process
    if (chargeVersion.status === 'current') {
      const calculatedTransactions = _generateCalculatedTransactions(billingPeriod, chargeVersion)
      acc[billingInvoiceLicenceId].calculatedTransactions.push(...calculatedTransactions)
    }

    return acc
  }, {})
}

/**
 * Persists the transaction, invoice and invoice licence records in the db
 */
async function _persistData (dataToPersist) {
  // If we don't have any transactions to persist then we also won't have any invoices or invoice licences, so we
  // simply return early
  if (dataToPersist.transactions.length === 0) {
    return false
  }

  await BillingTransactionModel.query().insert(dataToPersist.transactions)
  await BillingInvoiceModel.query().insert(dataToPersist.billingInvoices)
  await BillingInvoiceLicenceModel.query().insert(dataToPersist.billingInvoiceLicences)

  return true
}

function _retrievePreGeneratedData (preGeneratedData, invoiceAccountId, licence) {
  const { billingInvoices, billingInvoiceLicences } = preGeneratedData

  const billingInvoice = billingInvoices[invoiceAccountId]

  const billingInvoiceLicenceKey = _billingInvoiceLicenceKey(billingInvoice.billingInvoiceId, licence.licenceId)
  const billingInvoiceLicence = billingInvoiceLicences[billingInvoiceLicenceKey]

  return { billingInvoice, billingInvoiceLicence }
}

function _billingInvoiceLicenceKey (billingInvoiceId, licenceId) {
  return `${billingInvoiceId}-${licenceId}`
}

function _initialBillingData (licence, billingInvoice, billingInvoiceLicence) {
  return {
    licence,
    billingInvoice,
    billingInvoiceLicence,
    calculatedTransactions: []
  }
}

async function _cleanseTransactions (currentBillingData, billingPeriod) {
  // Guard clause which is most likely to hit in the event that no charge versions were 'fetched' to be billed in the
  // first place
  if (!currentBillingData.billingInvoice) {
    return []
  }

  const cleansedTransactions = await ProcessBillingTransactionsService.go(
    currentBillingData.calculatedTransactions,
    currentBillingData.billingInvoice,
    currentBillingData.billingInvoiceLicence,
    billingPeriod
  )

  return cleansedTransactions
}

function _generateCalculatedTransactions (billingPeriod, chargeVersion) {
  try {
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

    if (!chargePeriod.startDate) {
      return []
    }

    const isNewLicence = DetermineMinimumChargeService.go(chargeVersion, chargePeriod)
    const isWaterUndertaker = chargeVersion.licence.isWaterUndertaker

    // We use flatMap as GenerateBillingTransactionsService returns an array of transactions
    const transactions = chargeVersion.chargeElements.flatMap((chargeElement) => {
      return GenerateBillingTransactionsService.go(
        chargeElement,
        billingPeriod,
        chargePeriod,
        isNewLicence,
        isWaterUndertaker
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
