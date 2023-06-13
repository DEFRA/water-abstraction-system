'use strict'

/**
 * Handles the reissuing of invoices
 * @module ReissueInvoicesService
 */
const { randomUUID } = require('crypto')

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingTransactionModel = require('../../models/water/billing-transaction.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const ChargingModuleReissueInvoiceService = require('../charging-module/reissue-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../charging-module/view-invoice.service.js')

// LEGACY PROCESS IS AS FOLLOWS:
//
// * For each `sourceInvoice` in `batch` to be reissued:
//     * Send a rebill request to the CM
//     * This returns 2 invoice ids
//     * For each id:
//         * Fetch `cmReissueInvoice` from the CM
//         * Map this to `reissueInvoice` as per https://github.com/DEFRA/water-abstraction-service/blob/main/src/lib/mappers/invoice.js#L172
//         * Set `reissueInvoice.originalInvoiceId` to be `sourceInvoice.billingInvoiceId`
//         * Set `reissueInvoice.billingBatchId` to be `batch.billingBatchId`
//         * Set `reissueInvoice.invoiceAccountId` to be `sourceInvoice.invoiceAccountId`
//         * Set `reissueInvoice.financialYearEnding` to be `sourceInvoice.financialYearEnding`
//         * Persist `reissueInvoice`
//         * For each `sourceInvoiceLicence` in `sourceInvoice`:
//             * Retrieve `cmLicence` from `cmReissueInvoice`, where `cmLicence.licenceNumber` === `sourceInvoiceLicence.licenceNumber`
//             * Create a new `reissueInvoiceLicence`:
//                 * `reissueInvoiceLicence.billingInvoiceId` = `reissueInvoice.billingInvoiceId`
//                 * `reissueInvoiceLicence.licenceRef` = `sourceInvoiceLicence.licenceNumber`
//                 * `reissueInvoiceLicence.licenceId` = `sourceInvoiceLicence.licenceId`
//             * Upsert `reissueInvoiceLicence`
//             * For each `sourceTransaction` in `sourceInvoiceLicence`:
//                 * Retrieve `cmTransaction` from `cmLicence`, where `cmTransaction.rebilledTransactionId` === `sourceTransaction.externalId`
//                 * Map `sourceTransaction` and `cmTransaction` to `reissueTransaction` as per https://github.com/DEFRA/water-abstraction-service/blob/main/src/modules/billing/mappers/transaction.js#L378 [we basically take `sourceTransaction` and overwrite certain parts with data from `cmTransaction`]
//                 * Persist `reissueTransaction`

/**
 * Handles the reissuing of invoices
 *
 * We get all invoices to be reissued for the given billing batch (ie. same region, and marked for reissuing). For each
 * one of these we follow the process:
 *
 * - Send a reissue request to the Charging Module, which creates 2 invoices on the CM side;
 * -
 *
 * TODO: full docs
 */
async function go (billingBatch) {
  let sourceInvoices

  // TODO: delete this, we only keep it here so we can ensure it isn't silently swallowed if it errors in the try-catch
  sourceInvoices = await _getInvoicesToReissue(billingBatch.regionId)

  try {
    sourceInvoices = await _getInvoicesToReissue(billingBatch.regionId)

    // If we have no invoices to reissue then return false
    if (sourceInvoices.length === 0) {
      return false
    }
  } catch (_error) {
    // If getting invoices errors then we simply return; we haven't yet modified the db so we can still process the rest
    // of the billing batch without needing to mark it as failed
    return false
  }

  // TODO: Refactor to pre-generate this data
  const dataToPersist = {
    reissueBillingInvoices: [],
    reissueBillingInvoiceLicences: [],
    reissueTransactions: []
  }

  for (const sourceInvoice of sourceInvoices) {
    const cmReissueResponses = await _sendReissueRequest(billingBatch.externalId, sourceInvoice.externalId)

    for (const cmReissueResponse of cmReissueResponses) {
      const cmReissueInvoice = await _sendViewInvoiceRequest(billingBatch, cmReissueResponse)

      // TODO: Refactor to pre-generate this data
      const reissueInvoice = _retrieveOrGenerateBillingInvoice(dataToPersist, sourceInvoice, billingBatch, cmReissueInvoice)

      for (const sourceInvoiceLicence of sourceInvoice.billingInvoiceLicences) {
        // TODO: Refactor to pre-generate this data
        const reissueInvoiceLicence = _retrieveOrGenerateBillingInvoiceLicence(dataToPersist, sourceInvoice, reissueInvoice.billingInvoiceId, sourceInvoiceLicence)

        const cmLicence = _retrieveCMLicence(cmReissueInvoice, sourceInvoiceLicence.licenceRef)

        for (const sourceTransaction of sourceInvoiceLicence.billingTransactions) {
          const cmTransaction = _retrieveCMTransaction(cmLicence, sourceTransaction.externalId)
          const reissueTransaction = _generateReissueTransaction(cmTransaction, sourceTransaction, reissueInvoiceLicence.billingInvoiceLicenceId)
          dataToPersist.reissueTransactions.push(reissueTransaction)
        }
      }
    }

    // Now that we've handled the invoice, we update its record
    await _updateInvoiceRecord(sourceInvoice)
  }

  await _persistData(dataToPersist)

  return true
}

async function _persistData (dataToPersist) {
  await BillingInvoiceLicenceModel.query().insert(dataToPersist.reissueBillingInvoiceLicences)
  await BillingInvoiceModel.query().insert(dataToPersist.reissueBillingInvoices)
  await BillingTransactionModel.query().insert(dataToPersist.reissueTransactions)
}

function _generateReissueTransaction (cmTransaction, sourceTransaction, billingInvoiceLicenceId) {
  // TODO: Going by SendBillingTransactionsService I believe the only fields we need to overwrite with cm detail are:
  // - status
  // - externalId
  // - billingInvoiceLicenceId
  const reissuedBillingTransactionId = randomUUID({ disableEntropyCache: true })

  return {
    ...sourceTransaction,
    billingTransactionId: reissuedBillingTransactionId,
    // TODO: Check if this is correct. Legacy code maps the transaction status but from studying the code it only
    // converts `unbilled` status to `charge_created` -- any other status returns `undefined`:
    // https://github.com/DEFRA/water-abstraction-service/blob/main/src/modules/billing/mappers/transaction.js#L371
    // HOWEVER I can't see where this status comes from? Even searching `unbilled` in the service only finds this bit
    // of code, and it doesn't appear to come from the CM? (can't see it in the CM code) Perhaps we need to hardcode it
    // as 'charge_created'?
    status: cmTransaction.transactionStatus === 'unbilled' ? 'charge_created' : undefined,
    externalId: cmTransaction.id,
    billingInvoiceLicenceId
  }
}

function _retrieveCMTransaction (cmLicence, id) {
  return cmLicence.transactions.find((cmTransaction) => {
    return cmTransaction.rebilledTransactionId === id
  })
}

function _retrieveCMLicence (cmInvoice, licenceRef) {
  return cmInvoice.licences.find((cmLicence) => {
    return cmLicence.licenceNumber === licenceRef
  })
}

function _translateCMInvoice (cmInvoice) {
  const cmRebilledTypes = new Map()
    .set('C', 'reversal')
    .set('R', 'rebill')
    .set('O', null)

  return {
    // TODO: check that these are the actual fields and not just some weird interim ones
    externalId: cmInvoice.id,
    netAmount: cmInvoice.netTotal,
    isDeMinimis: cmInvoice.deminimisInvoice,
    invoiceValue: cmInvoice.debitLineValue,
    // As per legacy code we invert the sign of creditLineValue
    creditNoteValue: -cmInvoice.creditLineValue,
    rebillingState: cmRebilledTypes.get(cmInvoice.rebilledType)
  }
}

async function _sendViewInvoiceRequest (billingBatch, reissueInvoice) {
  try {
    const result = await ChargingModuleViewInvoiceService.go(billingBatch.externalId, reissueInvoice.id)
    return result.response.invoice
  } catch (error) {
    throw new Error(`Charging Module view invoice request failed: ${error.message}`)
  }
}

function _retrieveOrGenerateBillingInvoice (dataToPersist, sourceInvoice, billingBatch, cmReissueInvoice) {
  let reissueBillingInvoice

  const existingBillingInvoice = dataToPersist.reissueBillingInvoices.find(inv => inv.invoiceAccountId === sourceInvoice.invoiceAccountId)

  if (!existingBillingInvoice) {
    const translatedCMInvoice = _translateCMInvoice(cmReissueInvoice)
    const generatedBillingInvoice = GenerateBillingInvoiceService.go(sourceInvoice, billingBatch.billingBatchId, sourceInvoice.financialYearEnding)

    reissueBillingInvoice = {
      ...translatedCMInvoice,
      ...generatedBillingInvoice,
      // TODO: check if this is originalInvoiceId or originalBillingInvoiceId
      originalBillingInvoiceId: sourceInvoice.billingInvoiceId
    }

    dataToPersist.reissueBillingInvoices.push(reissueBillingInvoice)
  } else {
    reissueBillingInvoice = existingBillingInvoice
  }

  return reissueBillingInvoice
}

function _retrieveOrGenerateBillingInvoiceLicence (dataToPersist, sourceInvoice, billingInvoiceId, sourceInvoiceLicence) {
  let reissueBillingInvoiceLicence

  const existingBillingInvoiceLicence = dataToPersist.reissueBillingInvoiceLicences.find(inv => inv.invoiceAccountId === sourceInvoice.invoiceAccountId)

  if (!existingBillingInvoiceLicence) {
    reissueBillingInvoiceLicence = GenerateBillingInvoiceLicenceService.go(billingInvoiceId, sourceInvoiceLicence)
    dataToPersist.reissueBillingInvoiceLicences.push(reissueBillingInvoiceLicence)
  } else {
    reissueBillingInvoiceLicence = existingBillingInvoiceLicence
  }

  return reissueBillingInvoiceLicence
}

/**
 * Get billing invoices marked for rebilling for the specified region and their transactions
 */
async function _getInvoicesToReissue (regionId) {
  const result = await BillingInvoiceModel.query()
    .joinRelated('billingBatch')
    // TODO: update test to create a billing invoice licence and some transactions
    // TODO: optimise this to only return what we need from the billing invoice licences and the transactions
    .withGraphFetched('billingInvoiceLicences.billingTransactions')
    .where({
      'billingBatch.regionId': regionId,
      isFlaggedForRebilling: true
    })

  return result
}

async function _sendReissueRequest (billingBatchExternalId, invoiceExternalId) {
  try {
    const result = await ChargingModuleReissueInvoiceService.go(billingBatchExternalId, invoiceExternalId)
    return result.response.invoices
  } catch (error) {
    throw new Error(`Charging Module reissue request failed: ${error.message}`)
  }
}

async function _updateInvoiceRecord (invoice) {
  // Set `rebilling_state` to `rebilled`

  // Set `original_billing_invoice_id` to EITHER the existing value of `original_billing_invoice_id` if there is one,
  // or `invoice_id` if there isn't [double-check if still needed and that we haven't already done this previously?]
}

module.exports = {
  go
}
