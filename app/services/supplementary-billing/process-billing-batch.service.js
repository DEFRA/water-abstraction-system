'use strict'

/**
 * Processes a new billing batch
 * @module ProcessBillingBatchService
 */

const { randomUUID } = require('crypto')

const BillingBatchModel = require('../../models/water/billing-batch.model.js')
const ChargingModuleCreateTransactionService = require('../charging-module/create-transaction.service.js')
const ChargingModuleGenerateService = require('..//charging-module/generate-bill-run.service.js')
const ChargingModuleCreateTransactionPresenter = require('../../presenters/charging-module/create-transaction.presenter.js')
const CreateBillingInvoiceService = require('./create-billing-invoice.service.js')
const CreateBillingInvoiceLicenceService = require('./create-billing-invoice-licence.service.js')
const CreateBillingTransactionService = require('./create-billing-transaction.service.js')
const DetermineMinimumChargeService = require('./determine-minimum-charge.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FormatSrocTransactionLineService = require('./format-sroc-transaction-line.service.js')
const LegacyRequestLib = require('../../lib/legacy-request.lib.js')

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

  await _updateStatus(billingBatchId, 'processing')

  // We know in the future we will be calculating multiple billing periods and so will have to iterate through each,
  // generating bill runs and reviewing if there is anything to bill. For now, whilst our knowledge of the process
  // is low we are focusing on just the current financial year, and intending to ship a working version for just it.
  // This is why we are only passing through the first billing period; we know there is only one!
  const chargeVersions = await FetchChargeVersionsService.go(billingBatch.regionId, billingPeriod)

  // TODO: Handle an empty billing invoice
  for (const chargeVersion of chargeVersions) {
    const billingInvoice = await CreateBillingInvoiceService.go(chargeVersion, billingPeriod, billingBatchId)
    const billingInvoiceLicence = await CreateBillingInvoiceLicenceService.go(billingInvoice, chargeVersion.licence)

    await _processTransactionLines(
      billingBatch.externalId,
      billingPeriod,
      chargeVersion,
      billingInvoice.invoiceAccountNumber,
      billingInvoiceLicence.billingInvoiceLicenceId
    )
  }

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

async function _processTransactionLines (cmBillRunId, billingPeriod, chargeVersion, invoiceAccountNumber, billingInvoiceLicenceId) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  if (chargeVersion.chargeElements) {
    for (const chargeElement of chargeVersion.chargeElements) {
      const options = {
        isTwoPartSecondPartCharge: false,
        isWaterUndertaker: chargeVersion.licence.isWaterUndertaker,
        isNewLicence: DetermineMinimumChargeService.go(chargeVersion, financialYearEnding),
        isCompensationCharge: false
      }

      let transaction = await _processTransactionLine(
        chargeElement,
        chargeVersion,
        billingPeriod,
        cmBillRunId,
        billingInvoiceLicenceId,
        invoiceAccountNumber,
        options
      )

      if (transaction.billableDays === 0) {
        return
      }

      // Compensation charge line
      // First, we look to see if there is anything to bill. If there is we then determine if a compensation charge line
      // is needed. From looking at the legacy code this is based purely on whether the licence is flagged as a
      // water undertaker
      if (!options.isWaterUndertaker) {
        options.isCompensationCharge = true
        transaction = await _processTransactionLine(
          chargeElement,
          chargeVersion,
          billingPeriod,
          cmBillRunId,
          billingInvoiceLicenceId,
          invoiceAccountNumber,
          options
        )
      }
    }
  }
}

async function _processTransactionLine (
  chargeElement,
  chargeVersion,
  billingPeriod,
  cmBillRunId,
  billingInvoiceLicenceId,
  invoiceAccountNumber,
  options
) {
  const transaction = {
    ...FormatSrocTransactionLineService.go(chargeElement, chargeVersion, billingPeriod, options),
    billingInvoiceLicenceId
  }

  // No point carrying on if there is nothing to bill
  if (transaction.billableDays === 0) {
    return transaction
  }

  // We set `disableEntropyCache` to `false` as normally, for performance reasons node caches enough random data to
  // generate up to 128 UUIDs. We disable this as we may need to generate more than this and the performance hit in
  // disabling this cache is a rounding error in comparison to the rest of the process.
  //
  // https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  transaction.billingTransactionId = randomUUID({ disableEntropyCache: true })

  const chargingModuleRequest = ChargingModuleCreateTransactionPresenter.go(
    transaction,
    billingPeriod,
    invoiceAccountNumber,
    chargeVersion.licence
  )

  const chargingModuleResponse = await ChargingModuleCreateTransactionService.go(cmBillRunId, chargingModuleRequest)

  // TODO: Handle a failed request
  transaction.status = 'charge_created'
  transaction.externalId = chargingModuleResponse.response.body.transaction.id

  await CreateBillingTransactionService.go(transaction)

  return transaction
}

module.exports = {
  go
}
