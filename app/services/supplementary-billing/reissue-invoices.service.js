'use strict'

/**
 * Handles the reissuing of invoices
 * @module ReissueInvoicesService
 */
const { randomUUID } = require('crypto')

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const BillingTransactionModel = require('../../models/water/billing-transaction.model.js')
const ChargingModuleReissueInvoiceService = require('../charging-module/reissue-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../charging-module/view-invoice.service.js')

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
async function go (originalBillingBatch, reissueBillingBatch) {
  const sourceInvoices = await _fetchInvoicesToReissue(originalBillingBatch.regionId)

  if (sourceInvoices.length === 0) {
    return false
  }

  // TODO: Refactor to pre-generate this data
  const dataToPersist = {
    reissueBillingInvoices: [],
    reissueBillingInvoiceLicences: [],
    reissueTransactions: []
  }

  for (const sourceInvoice of sourceInvoices) {
    await _handleSourceInvoice(sourceInvoice, dataToPersist, originalBillingBatch, reissueBillingBatch)
  }

  await _persistData(dataToPersist)

  return true
}

async function _handleSourceInvoice (sourceInvoice, dataToPersist, originalBillingBatch, reissueBillingBatch) {
  const chargingModuleReissueResponses = await _sendReissueRequest(
    originalBillingBatch.externalId,
    sourceInvoice.externalId
  )

  for (const chargingModuleReissueResponse of chargingModuleReissueResponses) {
    const chargingModuleReissueInvoice = await _sendViewInvoiceRequest(
      originalBillingBatch,
      chargingModuleReissueResponse
    )

    const reissueBillingInvoice = _retrieveOrGenerateBillingInvoice(
      dataToPersist,
      sourceInvoice,
      reissueBillingBatch,
      chargingModuleReissueInvoice
    )

    for (const sourceInvoiceLicence of sourceInvoice.billingInvoiceLicences) {
      const reissueInvoiceLicence = _retrieveOrGenerateBillingInvoiceLicence(
        dataToPersist,
        sourceInvoice,
        reissueBillingInvoice.billingInvoiceId,
        sourceInvoiceLicence
      )

      const cmLicence = _retrieveCMLicence(chargingModuleReissueInvoice, sourceInvoiceLicence.licenceRef)

      for (const sourceTransaction of sourceInvoiceLicence.billingTransactions) {
        const isCancellingInvoice = _isCancellingInvoice(chargingModuleReissueResponse)

        const chargingModuleTransaction = _retrieveChargingModuleTransaction(cmLicence, sourceTransaction.externalId)

        const reissueTransaction = _generateReissueTransaction(
          chargingModuleTransaction,
          sourceTransaction,
          reissueInvoiceLicence.billingInvoiceLicenceId,
          isCancellingInvoice
        )

        dataToPersist.reissueTransactions.push(reissueTransaction)
      }
    }
  }

  await _markSourceInvoiceAsRebilled(sourceInvoice)
}

function _isCancellingInvoice (chargingModuleReissueResponse) {
  return chargingModuleReissueResponse.rebilledType === 'C'
}

async function _persistData (dataToPersist) {
  await BillingInvoiceModel.query().insert(dataToPersist.reissueBillingInvoices)
  await BillingInvoiceLicenceModel.query().insert(dataToPersist.reissueBillingInvoiceLicences)
  await BillingTransactionModel.query().insert(dataToPersist.reissueTransactions)
}

function _generateReissueTransaction (chargingModuleTransaction, sourceTransaction, billingInvoiceLicenceId, isCancellingInvoice) {
  const reissuedBillingTransactionId = randomUUID({ disableEntropyCache: true })

  return {
    ...sourceTransaction,
    isCredit: _determineIsCredit(sourceTransaction.isCredit, isCancellingInvoice),
    billingTransactionId: reissuedBillingTransactionId,
    externalId: chargingModuleTransaction.id,
    billingInvoiceLicenceId
  }
}

function _determineIsCredit (originalIsCredit, isCancellingInvoice) {
  // If this is a cancelling invoice then we invert isCredit so it cancels out the original transaction; otherwise, we
  // use the original value
  return isCancellingInvoice ? !originalIsCredit : originalIsCredit
}

function _retrieveChargingModuleTransaction (chargingModuleLicence, id) {
  return chargingModuleLicence.transactions.find((transaction) => {
    return transaction.rebilledTransactionId === id
  })
}

function _retrieveCMLicence (chargingModuleInvoice, licenceRef) {
  return chargingModuleInvoice.licences.find((licence) => {
    return licence.licenceNumber === licenceRef
  })
}

function _translateChargingModuleInvoice (chargingModuleInvoice) {
  const chargingModuleRebilledTypes = new Map()
    .set('C', 'reversal')
    .set('R', 'rebill')
    .set('O', null)

  return {
    externalId: chargingModuleInvoice.id,
    netAmount: chargingModuleInvoice.netTotal,
    isDeMinimis: chargingModuleInvoice.deminimisInvoice,
    invoiceValue: chargingModuleInvoice.debitLineValue,
    // As per legacy code we invert the sign of creditLineValue
    creditNoteValue: -chargingModuleInvoice.creditLineValue,
    rebillingState: chargingModuleRebilledTypes.get(chargingModuleInvoice.rebilledType)
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

function _retrieveOrGenerateBillingInvoice (dataToPersist, sourceInvoice, reissueBillingBatch, chargingModuleReissueInvoice) {
  // Because we have nested iteration of source invoice and Charging Module reissue invoice, we need to ensure we have
  // a billing invoice for every combination of these, hence we search by both of their ids
  const existingBillingInvoice = dataToPersist.reissueBillingInvoices.find((invoice) => {
    return invoice.invoiceAccountId === sourceInvoice.invoiceAccountId &&
      invoice.externalId === chargingModuleReissueInvoice.id
  })

  if (existingBillingInvoice) {
    return existingBillingInvoice
  }

  const translatedChargingModuleInvoice = _translateChargingModuleInvoice(chargingModuleReissueInvoice)
  const generatedBillingInvoice = GenerateBillingInvoiceService.go(
    sourceInvoice,
    reissueBillingBatch.billingBatchId,
    sourceInvoice.financialYearEnding
  )

  const reissueBillingInvoice = {
    ...translatedChargingModuleInvoice,
    ...generatedBillingInvoice,
    originalBillingInvoiceId: sourceInvoice.billingInvoiceId
  }

  dataToPersist.reissueBillingInvoices.push(reissueBillingInvoice)

  return reissueBillingInvoice
}

function _retrieveOrGenerateBillingInvoiceLicence (dataToPersist, sourceInvoice, billingInvoiceId, sourceInvoiceLicence) {
  const existingBillingInvoiceLicence = dataToPersist.reissueBillingInvoiceLicences.find((invoice) => {
    return invoice.invoiceAccountId === sourceInvoice.invoiceAccountId
  })

  if (existingBillingInvoiceLicence) {
    return existingBillingInvoiceLicence
  }

  const reissueBillingInvoiceLicence = GenerateBillingInvoiceLicenceService.go(billingInvoiceId, sourceInvoiceLicence)

  dataToPersist.reissueBillingInvoiceLicences.push(reissueBillingInvoiceLicence)

  return reissueBillingInvoiceLicence
}

/**
 * Get billing invoices marked for rebilling for the specified region and their transactions
 */
async function _fetchInvoicesToReissue (regionId) {
  try {
    // TODO: optimise this to only return what we need from the billing invoice licences and the transactions
    const result = await BillingInvoiceModel.query()
      .joinRelated('billingBatch')
      .withGraphFetched('billingInvoiceLicences.billingTransactions')
      .where({
        'billingBatch.regionId': regionId,
        isFlaggedForRebilling: true
      })

    return result
  } catch (_error) {
    // If getting invoices errors then we log the error and return an empty array; the db hasn't yet been modified at
    // this stage so we can simply move on to the next stage of processing the billing batch.

    // TODO: add logging
    return []
  }
}

async function _sendReissueRequest (billingBatchExternalId, invoiceExternalId) {
  try {
    const result = await ChargingModuleReissueInvoiceService.go(billingBatchExternalId, invoiceExternalId)
    return result.response.invoices
  } catch (error) {
    throw new Error(`Charging Module reissue request failed: ${error.message}`)
  }
}

async function _markSourceInvoiceAsRebilled (sourceInvoice) {
  await sourceInvoice.$query().patch({
    rebillingState: 'rebilled',
    // If the source invoice's originalBillingInvoiceId field is `null` then we update it with the invoice's id;
    // otherwise, we use its existing value. This ensures that if we reissue an invoice, then reissue that reissuing
    // invoice, every invoice in the chain will have originalBillingInvoiceId pointing back to the very first invoice in
    // the chain
    originalBillingInvoiceId: sourceInvoice.originalBillingInvoiceId ?? sourceInvoice.billingInvoiceId
  })
}

module.exports = {
  go
}
