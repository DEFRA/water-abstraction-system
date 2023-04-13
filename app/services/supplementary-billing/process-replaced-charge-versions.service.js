'use strict'

/**
 * Processes the replaced charge versions of licences to be included in supplementary billing
 * @module ProcessReplacedChargeVersionsService
 */

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const ChargingModuleCreateTransactionService = require('../charging-module/create-transaction.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')
const CreateBillingTransactionService = require('./create-billing-transaction.service.js')
const FetchReplacedChargeVersionsService = require('./fetch-replaced-charge-versions.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const ProcessPreviousBillingTransactionsService = require('./process-previous-billing-transactions.service.js')

/**
 * Finds any replaced charge versions and creates any transactions required to cancel out the replaced transactions,
 * plus any invoices they require, in both WRLS and the Charging Module API
 *
 * @param {module:BillingBatchModel} billingBatch The billing batch we need to process
 * @param {Object} billingPeriod an object representing the financial year the transaction is for
 * @returns {Boolean} Returns `true` if any transactions were generated, otherwise `false`
 */
async function go (billingBatch, billingPeriod) {
  const currentBillingData = {
    isEmpty: true,
    licence: null,
    billingInvoice: null,
    billingInvoiceLicence: null
  }

  const replacedChargeVersions = await _fetchReplacedChargeVersions(billingBatch, billingPeriod)

  for (const chargeVersion of replacedChargeVersions) {
    const { billingInvoice, billingInvoiceLicence } = await _generateInvoiceData(
      currentBillingData,
      billingBatch,
      chargeVersion,
      billingPeriod
    )

    // We need to deal with the very first iteration when currentBillingData is all nulls! So, we check both there is
    // a billingInvoiceLicence and that its ID is different
    if (
      currentBillingData.billingInvoiceLicence &&
      currentBillingData.billingInvoiceLicence.billingInvoiceLicenceId !== billingInvoiceLicence.billingInvoiceLicenceId
    ) {
      await _finaliseCurrentInvoiceLicence(currentBillingData, billingPeriod, billingBatch)
    }

    currentBillingData.licence = chargeVersion.licence
    currentBillingData.billingInvoice = billingInvoice
    currentBillingData.billingInvoiceLicence = billingInvoiceLicence
  }
  await _finaliseCurrentInvoiceLicence(currentBillingData, billingPeriod, billingBatch)

  // We return `true` if we generated any transactions and `false` if we didn't
  return !currentBillingData.isEmpty
}

async function _fetchReplacedChargeVersions (billingBatch, billingPeriod) {
  const { billingBatchId, regionId } = billingBatch

  return await FetchReplacedChargeVersionsService.go(regionId, billingPeriod, billingBatchId)
}

async function _createBillingInvoiceLicence (currentBillingData) {
  const { billingInvoice, billingInvoiceLicence } = currentBillingData

  if (!billingInvoice.persisted) {
    await BillingInvoiceModel.query().insert(billingInvoice)
    billingInvoice.persisted = true
  }

  await BillingInvoiceLicenceModel.query().insert(billingInvoiceLicence)
}

async function _createBillingTransactions (currentBillingData, billingBatch, billingTransactions, billingPeriod) {
  const { licence, billingInvoice, billingInvoiceLicence } = currentBillingData

  for (const transaction of billingTransactions) {
    const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
      transaction,
      billingPeriod,
      billingInvoice.invoiceAccountNumber,
      licence
    )

    const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(billingBatch.externalId, chargingModuleRequest)

    transaction.status = 'charge_created'
    transaction.externalId = chargingModuleResponse.response.body.transaction.id
    transaction.billingInvoiceLicenceId = billingInvoiceLicence.billingInvoiceLicenceId

    await CreateBillingTransactionService.go(transaction)
  }
}

/**
 * Reverses any debit transactions from the previous billing batch, creates them in the db, and persists the billing
 * invoice and billing invoice licence as needed
 */
async function _finaliseCurrentInvoiceLicence (currentBillingData, billingPeriod, billingBatch) {
  // Guard clause which is most likely to hit in the event that no charge versions were 'fetched' to be billed in the
  // first place
  if (!currentBillingData.billingInvoice) {
    return
  }

  const reversingPreviousTransactions = await ProcessPreviousBillingTransactionsService.go(
    currentBillingData.billingInvoice,
    currentBillingData.billingInvoiceLicence,
    billingPeriod
  )

  if (reversingPreviousTransactions.length > 0) {
    currentBillingData.isEmpty = false

    await _createBillingTransactions(currentBillingData, billingBatch, reversingPreviousTransactions, billingPeriod)
    await _createBillingInvoiceLicence(currentBillingData)
  }
}

async function _generateInvoiceData (currentBillingData, billingBatch, chargeVersion, billingPeriod) {
  const { invoiceAccountId, licence } = chargeVersion
  const { billingBatchId } = billingBatch
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  const billingInvoice = await GenerateBillingInvoiceService.go(
    currentBillingData.billingInvoice,
    invoiceAccountId,
    billingBatchId,
    financialYearEnding
  )
  const billingInvoiceLicence = GenerateBillingInvoiceLicenceService.go(
    currentBillingData.billingInvoiceLicence,
    billingInvoice.billingInvoiceId,
    licence
  )

  return {
    billingInvoice,
    billingInvoiceLicence
  }
}

module.exports = {
  go
}
