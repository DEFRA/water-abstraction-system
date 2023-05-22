'use strict'

/**
 * Processes the charge versions for a given billing period
 * @module ProcessBillingPeriodService
 */

const BillingBatchError = require('../../errors/billing-batch.error.js')
const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const BillingTransactionModel = require('../../models/water/billing-transaction.model.js')
const ChargingModuleCreateTransactionService = require('../charging-module/create-transaction.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')
const DetermineChargePeriodService = require('./determine-charge-period.service.js')
const DetermineMinimumChargeService = require('./determine-minimum-charge.service.js')
const FetchInvoiceAccountNumbersService = require('./fetch-invoice-account-numbers.service.js')
const GenerateBillingTransactionsService = require('./generate-billing-transactions.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const ProcessBillingTransactionsService = require('./process-billing-transactions.service.js')

/**
 * Creates the invoices and transactions in both WRLS and the Charging Module API
 *
 * TODO: Currently a placeholder service. Proper implementation is coming
 *
 * @param {module:BillingBatchModel} billingBatch The newly created bill batch we need to process
 * @param {Object} billingPeriod An object representing the financial year the transaction is for
 *
 * @returns {Boolean} true if the bill run is empty (no transactions to bill were generated) else false
 */
async function go (billingBatch, billingPeriod, chargeVersions) {
  if (chargeVersions.length === 0) {
    return true
  }

  const { billingBatchId } = billingBatch

  const invoiceAccounts = await FetchInvoiceAccountNumbersService.go(chargeVersions)
  const fetchedData = { invoiceAccounts, chargeVersions }
  const preGeneratedData = _preGenerateData(fetchedData, billingBatchId, billingPeriod)

  const billingData = _buildBillingDataWithTransactions(fetchedData, preGeneratedData, billingPeriod, billingBatchId)
  const dataToPersist = await _buildDataToPersist(billingData, billingPeriod, billingBatch)

  await _persistData(dataToPersist)

  return dataToPersist.billingInvoiceLicences.length === 0
}

/**
 * Pre-generates the empty billing invoices and billing invoice licences we will be populating
 */
function _preGenerateData (fetchedData, billingBatchId, billingPeriod) {
  const { chargeVersions, invoiceAccounts } = fetchedData

  const billingInvoices = _preGenerateBillingInvoices(invoiceAccounts, billingBatchId, billingPeriod)
  const billingInvoiceLicences = _preGenerateBillingInvoiceLicences(chargeVersions, billingInvoices)

  return { billingInvoices, billingInvoiceLicences }
}

/**
 * Iterates over the populated billing data and builds an object of data to be persisted. This process includes sending
 * "create transaction" requests to the Charging Module as this data is needed to fully create our transaction records
 */
async function _buildDataToPersist (billingData, billingPeriod, billingBatch) {
  const dataToPersist = {
    transactions: [],
    billingInvoices: new Set(),
    billingInvoiceLicences: []
  }

  for (const currentBillingData of Object.values(billingData)) {
    const cleansedTransactions = await _cleanseTransactions(currentBillingData, billingPeriod)

    if (cleansedTransactions.length !== 0) {
      const billingTransactions = await _generateBillingTransactions(
        currentBillingData,
        billingBatch,
        cleansedTransactions,
        billingPeriod
      )

      dataToPersist.transactions.push(...billingTransactions)
      // Note that Sets use add rather than push
      dataToPersist.billingInvoices.add(currentBillingData.billingInvoice)
      dataToPersist.billingInvoiceLicences.push(currentBillingData.billingInvoiceLicence)
    }
  }

  return dataToPersist
}

/**
 * Processes each charge version and and returns an object where each key is a billing invoice id which exists in one or
 * more charge versions and the key's value is an object containing the associated licence, billing invoice and billing
 * invoice licence, along with any required transactions, eg:
 *
 * {
 *   'billing-invoice-licence-id-1': {
 *     billingInvoiceLicence: '...', // instance of the billing invoice licence
 *     licence: '...', // instance of the licence for this billing invoice licence
 *     billingInvoice: '...', // instance of the billing invoice for this billing invoice licence
 *     transactions: [] // array of calculated transactions for this billing invoice licence
 *   },
 *   'billing-invoice-licence-id-2': {
 *     // Same object structure as above
 *   }
 * }
 */
function _buildBillingDataWithTransactions (fetchedData, preGeneratedData, billingPeriod, billingBatchId) {
  const { chargeVersions } = fetchedData

  // We use reduce to build up the object as this allows us to start with an empty object and populate it with each
  // charge version.
  return chargeVersions.reduce((acc, chargeVersion) => {
    // We only need to handle charge versions with a status of `current`
    if (chargeVersion.status !== 'current') {
      return acc
    }

    const { billingInvoiceLicence, billingInvoice } = _retrievePreGeneratedData(preGeneratedData, chargeVersion)
    const { billingInvoiceLicenceId } = billingInvoiceLicence

    if (!acc[billingInvoiceLicenceId]) {
      acc[billingInvoiceLicenceId] = _initialBillingData(chargeVersion, billingInvoice, billingInvoiceLicence)
    }

    const calculatedTransactions = _generateCalculatedTransactions(billingPeriod, chargeVersion, billingBatchId)
    acc[billingInvoiceLicenceId].calculatedTransactions.push(...calculatedTransactions)

    return acc
  }, {})
}

/**
 * Persists the transaction, invoice and invoice licence records in the db
 */
async function _persistData (dataToPersist) {
  if (dataToPersist.transactions.length !== 0) {
    await BillingTransactionModel.query().insert(dataToPersist.transactions)
  }

  // Note that Sets have a size property rather than length
  if (dataToPersist.billingInvoices.size !== 0) {
    // We need to spread the Set into an array for Objection to accept it
    await BillingInvoiceModel.query().insert([...dataToPersist.billingInvoices])
  }

  if (dataToPersist.billingInvoiceLicences.length !== 0) {
    await BillingInvoiceLicenceModel.query().insert(dataToPersist.billingInvoiceLicences)
  }
}

function _retrievePreGeneratedData (preGeneratedData, chargeVersion) {
  const { billingInvoices, billingInvoiceLicences } = preGeneratedData

  const billingInvoice = billingInvoices[chargeVersion.invoiceAccountId]

  const billingInvoiceLicenceKey = _billingInvoiceLicenceKey(
    billingInvoice.billingInvoiceId,
    chargeVersion.licence.licenceId
  )
  const billingInvoiceLicence = billingInvoiceLicences[billingInvoiceLicenceKey]

  return { billingInvoice, billingInvoiceLicence }
}

/**
  * We pre-generate billing invoice licences for every combination of billing invoice and licence in the charge versions
  * so that we don't need to fetch any data from the db during the main charge version processing loop. This function
  * generates the required billing invoice licences and returns an object where each key is a concatenated billing
  * invoice id and licence id, and each value is the billing invoice licence for that combination of billing invoice and
  * licence, ie:
  *
  * {
  *   'key-1': { billingInvoiceLicenceId: 'billing-invoice-licence-1', ... },
  *   'key-2': { billingInvoiceLicenceId: 'billing-invoice-licence-2', ... }
  * }
  */
function _preGenerateBillingInvoiceLicences (chargeVersions, billingInvoices) {
  const keyedBillingInvoiceLicences = chargeVersions.reduce((acc, chargeVersion) => {
    const { billingInvoiceId } = billingInvoices[chargeVersion.invoiceAccountId]
    const { licence } = chargeVersion

    const key = _billingInvoiceLicenceKey(billingInvoiceId, licence.licenceId)

    // The charge versions may contain a combination of billing invoice and licence multiple times, so we check to see
    // if this combination has already had a billing invoice licence generated for it and return early if so
    if (acc.key) {
      return acc
    }

    return {
      ...acc,
      [key]: GenerateBillingInvoiceLicenceService.go(billingInvoiceId, licence)
    }
  }, {})

  return keyedBillingInvoiceLicences
}

function _billingInvoiceLicenceKey (billingInvoiceId, licenceId) {
  return `${billingInvoiceId}-${licenceId}`
}

/**
  * We pre-generate billing invoices for every invoice account so that we don't need to fetch any data from the db
  * during the main charge version processing loop. This function generates the required billing invoice licences and
  * returns an object where each key is the invoice account id, and each value is the billing invoice, ie:
  *
  * {
  *   'uuid-1': { invoiceAccountId: 'uuid-1', ... },
  *   'uuid-2': { invoiceAccountId: 'uuid-2', ... }
  * }
  */
function _preGenerateBillingInvoices (invoiceAccounts, billingBatchId, billingPeriod) {
  const keyedBillingInvoices = invoiceAccounts.reduce((acc, invoiceAccount) => {
    // Note that the array of invoice accounts will already have been deduped so we don't need to check whether a
    // billing invoice licence already exists in the object before generating one
    return {
      ...acc,
      [invoiceAccount.invoiceAccountId]: GenerateBillingInvoiceService.go(
        invoiceAccount,
        billingBatchId,
        billingPeriod.endDate.getFullYear()
      )
    }
  }, {})

  return keyedBillingInvoices
}

function _initialBillingData (chargeVersion, billingInvoice, billingInvoiceLicence) {
  return {
    licence: chargeVersion.licence,
    billingInvoice,
    billingInvoiceLicence,
    calculatedTransactions: []
  }
}

async function _generateBillingTransactions (currentBillingData, billingBatch, billingTransactions, billingPeriod) {
  const { licence, billingInvoice, billingInvoiceLicence } = currentBillingData

  try {
    const generatedTransactions = []

    for (const transaction of billingTransactions) {
      const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
        transaction,
        billingPeriod,
        billingInvoice.invoiceAccountNumber,
        licence
      )

      const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(
        billingBatch.externalId,
        chargingModuleRequest
      )

      transaction.status = 'charge_created'
      transaction.externalId = chargingModuleResponse.response.body.transaction.id
      transaction.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId

      generatedTransactions.push(transaction)
    }

    return generatedTransactions
  } catch (error) {
    throw new BillingBatchError(error, BillingBatchModel.errorCodes.failedToCreateCharge)
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

function _generateCalculatedTransactions (billingPeriod, chargeVersion, billingBatchId) {
  try {
    const financialYearEnding = billingPeriod.endDate.getFullYear()
    const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
    const isNewLicence = DetermineMinimumChargeService.go(chargeVersion, financialYearEnding)
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
    throw new BillingBatchError(error, BillingBatchModel.errorCodes.failedToPrepareTransactions)
  }
}

module.exports = {
  go
}
