'use strict'

/**
 * Processes a new billing batch
 * @module ProcessBillingBatchService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const ChargingModuleCreateTransactionService = require('../charging-module/create-transaction.service.js')
const ChargingModuleGenerateService = require('..//charging-module/generate-bill-run.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')
const CreateBillingInvoiceService = require('./create-billing-invoice.service.js')
const CreateBillingInvoiceLicenceService = require('./create-billing-invoice-licence.service.js')
const CreateBillingTransactionService = require('./create-billing-transaction.service.js')
const DetermineChargePeriodService = require('./determine-charge-period.service.js')
const DetermineMinimumChargeService = require('./determine-minimum-charge.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const GenerateBillingTransactionsService = require('./generate-billing-transactions.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')

/**
 * Creates the invoices and transactions in both WRLS and the Charging Module API
 *
 * TODO: Currently a placeholder service. Proper implementation is coming
 *
 * @param {module:BillingBatchModel} billingBatch The newly created bill batch we need to process
 * @param {Object} billingPeriod an object representing the financial year the transaction is for
 */
async function go (billingBatch, billingPeriod) {
  const { billingBatchId } = billingBatch
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  await _updateStatus(billingBatchId, 'processing')

  // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
  // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
  // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
  // This is why we are only passing through the first billing period; we know there is only one!
  const chargeVersions = await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)

  let generatedBillingInvoices = []
  let generatedBillingInvoiceLicences = []

  const billingInvoiceLicencesToPersist = {}
  const billingInvoicesToPersist = {}

  for (const chargeVersion of chargeVersions) {
    const { chargeElements, licence } = chargeVersion

    const currentBillingInvoice = await GenerateBillingInvoiceService.go(
      generatedBillingInvoices,
      chargeVersion.invoiceAccountId,
      billingBatchId,
      financialYearEnding
    )
    generatedBillingInvoices = currentBillingInvoice.billingInvoices

    const currentBillingInvoiceLicence = GenerateBillingInvoiceLicenceService.go(
      generatedBillingInvoiceLicences,
      currentBillingInvoice.billingInvoice.billingInvoiceId,
      licence
    )
    generatedBillingInvoiceLicences = currentBillingInvoiceLicence.billingInvoiceLicences

    if (chargeElements) {
      const transactionLines = _generateTransactionLines(billingPeriod, chargeVersion)

      if (transactionLines.length > 0) {
        await _createTransactionLines(
          transactionLines,
          billingPeriod,
          currentBillingInvoice.billingInvoice.invoiceAccountNumber,
          currentBillingInvoiceLicence.billingInvoiceLicence.billingInvoiceLicenceId,
          chargeVersion,
          billingBatch.externalId
        )

        // Our `billingInvoiceLicencesToPersist` object is a series of key/value pairs. Each key is the billing invoice
        // licence id, and the value is the billing invoice licence itself. We do this so we have a unique set of
        // billing invoice licences to persist, whereas if we were simply pushing them into an array we may have
        // duplicate entries which we would then have to filter out (or check whether they exist before adding)
        billingInvoiceLicencesToPersist[currentBillingInvoiceLicence.billingInvoiceLicence.billingInvoiceLicenceId] = currentBillingInvoiceLicence.billingInvoiceLicence
        billingInvoicesToPersist[currentBillingInvoice.billingInvoice.billingInvoiceId] = currentBillingInvoice.billingInvoice
      }
    }
  }

  await _persistBillingInvoiceLicences(billingInvoiceLicencesToPersist)
  await _persistBillingInvoices(billingInvoicesToPersist)

  await ChargingModuleGenerateService.go(billingBatch.externalId)

  // NOTE: Retaining this as a candidate for updating the bill run status if the process errors or the bill run is empty
  // await UpdateBillingBatchStatusService.go(billingData.id, 'ready')

  await LegacyRequestLib.post('water', `billing/batches/${billingBatchId}/refresh`)
}

async function _updateStatus (billingBatchId, status) {
  await BillingBatchModel.query()
    .findById(billingBatchId)
    .patch({ status })
}

function _generateTransactionLines (billingPeriod, chargeVersion) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()
  const chargePeriod = DetermineChargePeriodService.go(chargeVersion, financialYearEnding)
  const isNewLicence = DetermineMinimumChargeService.go(chargeVersion, financialYearEnding)
  const isWaterUndertaker = chargeVersion.licence.isWaterUndertaker

  const transactionLines = []
  for (const chargeElement of chargeVersion.chargeElements) {
    const result = GenerateBillingTransactionsService.go(chargeElement, billingPeriod, chargePeriod, isNewLicence, isWaterUndertaker)
    transactionLines.push(...result)
  }

  return transactionLines
}

async function _createTransactionLines (
  transactionLines,
  billingPeriod,
  invoiceAccountNumber,
  billingInvoiceLicenceId,
  chargeVersion,
  chargingModuleBillRunId
) {
  for (const transaction of transactionLines) {
    const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
      transaction,
      billingPeriod,
      invoiceAccountNumber,
      chargeVersion.licence
    )

    const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(chargingModuleBillRunId, chargingModuleRequest)

    // TODO: Handle a failed request
    transaction.status = 'charge_created'
    transaction.externalId = chargingModuleResponse.response.body.transaction.id
    transaction.billingInvoiceLicenceId = billingInvoiceLicenceId

    await CreateBillingTransactionService.go(transaction)
  }
}

async function _persistBillingInvoiceLicences (billingInvoiceLicencesToPersist) {
  const billingInvoiceLicencesToInsert = Object.values(billingInvoiceLicencesToPersist)

  await BillingInvoiceLicenceModel.query()
    .insert(billingInvoiceLicencesToInsert)
}

async function _persistBillingInvoices (billingInvoicesToPersist) {
  const billingInvoicesToInsert = Object.values(billingInvoicesToPersist)

  await BillingInvoiceModel.query()
    .insert(billingInvoicesToInsert)
}

module.exports = {
  go
}
