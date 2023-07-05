'use strict'

/**
 * Handles the reissuing of a single invoice
 * @module ReissueInvoiceService
 */
const { randomUUID } = require('crypto')

const ChargingModuleReissueInvoiceService = require('../charging-module/reissue-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../charging-module/view-invoice.service.js')
const GenerateBillingInvoiceLicenceService = require('./generate-billing-invoice-licence.service.js')
const GenerateBillingInvoiceService = require('./generate-billing-invoice.service.js')

/**
 * Handles the reissuing of a single invoice
 *
 * This service raises a reissue request with the Charging Module for an invoice (referred to as the "source" invoice)
 * which creates 2 invoices on the CM side: a "cancelling" invoice (ie. one which cancels out the source invoice by
 * being a credit for the same amount instead of a debit, or vice-versa) and a "reissuing" invoice (ie. the replacement
 * for the source invoice).
 *
 * This request is all that needs to be done on the CM, so we then move on to our side of things. We create two new
 * billing invoices on our side (a cancelling invoice and a reissuing invoice), and for each one we re-create the
 * billing invoice licences and transactions of the source invoice. While doing this we are loading up a `dataToReturn`
 * object with the new invoices, invoice licences and transactions.
 *
 * Once the invoice has been handled, we mark the source invoice as `rebilled` in the db (note that "rebill" is legacy
 * terminology for "reissue") along with the `originalBillingInvoiceId` field; if this is empty then we update it with
 * the source invoice's billing invoice id, or if it's already filled in then we leave it as-is. This ensures that if an
 * invoice is reissued, and that reissuing invoice is itself reissued, then `originalBillingInvoiceId` will still point
 * directly to the original source invoice.
 *
 * @param {module:BillingInvoiceModel} sourceInvoice The invoice to be reissued
 * @param {module:BillingBatchModel} reissueBillingBatch The billing batch that the new invoices should belong to
 *
 * @returns {Object} dataToReturn Data that has been generated while reissuing the invoice
 * @returns {Object[]} dataToReturn.billingInvoices Array of billing invoices
 * @returns {Object[]} dataToReturn.billingInvoiceLicences Array of billing invoice licences
 * @returns {Object[]} dataToReturn.billingTransactions Array of transactions
 */

async function go (sourceInvoice, reissueBillingBatch) {
  const dataToReturn = {
    billingInvoices: [],
    billingInvoiceLicences: [],
    billingTransactions: []
  }

  // When a reissue request is sent to the Charging Module, it creates 2 new invoices (one to cancel out the original
  // invoice and one to be the new version of it) and returns their ids
  const chargingModuleReissueResponse = await _sendReissueRequest(
    reissueBillingBatch.externalId,
    sourceInvoice.externalId
  )

  for (const chargingModuleReissueInvoiceInfo of chargingModuleReissueResponse) {
    // Because we only have the CM invoice's id we now need to fetch its details via the "view invoice" endpoint
    const chargingModuleReissueInvoice = await _sendViewInvoiceRequest(
      reissueBillingBatch,
      chargingModuleReissueInvoiceInfo
    )

    const reissueBillingInvoice = _retrieveOrGenerateBillingInvoice(
      dataToReturn,
      sourceInvoice,
      reissueBillingBatch,
      chargingModuleReissueInvoice
    )

    // The invoice we want to reissue will have one or more billing invoice licences on it which we need to re-create
    for (const sourceInvoiceLicence of sourceInvoice.billingInvoiceLicences) {
      const reissueInvoiceLicence = _retrieveOrGenerateBillingInvoiceLicence(
        dataToReturn,
        sourceInvoice,
        reissueBillingInvoice.billingInvoiceId,
        sourceInvoiceLicence
      )

      const chargingModuleLicence = _retrieveChargingModuleLicence(
        chargingModuleReissueInvoice,
        sourceInvoiceLicence.licenceRef
      )

      // The invoice licence we are re-creating will have one or more transactions on it which we also need to re-create
      for (const sourceTransaction of sourceInvoiceLicence.billingTransactions) {
        // Get the original transaction from the charging module data so we can create our new one
        const chargingModuleReissueTransaction = _retrieveChargingModuleTransaction(
          chargingModuleLicence,
          sourceTransaction.externalId
        )

        // We need to know if this is an invoice which is cancelling out the original so we can create our transactions
        // accordingly (ie. creating credit transactions to cancel out debits and vice-versa)
        const isCancellingInvoice = _isCancellingInvoice(chargingModuleReissueInvoiceInfo)

        const reissueTransaction = _generateTransaction(
          chargingModuleReissueTransaction.id,
          sourceTransaction,
          reissueInvoiceLicence.billingInvoiceLicenceId,
          isCancellingInvoice
        )

        dataToReturn.billingTransactions.push(reissueTransaction)
      }
    }
  }

  await _markSourceInvoiceAsRebilled(sourceInvoice)

  return dataToReturn
}

/**
 * Provides an `isCredit` value based on an original `isCredit` value and whether this is a cancelling invoice.
 */
function _determineIsCredit (originalIsCredit, isCancellingInvoice) {
  // If this is a cancelling invoice then we invert isCredit so it cancels out the original transaction; otherwise, we
  // use the original value
  return isCancellingInvoice ? !originalIsCredit : originalIsCredit
}

/**
 * Generates a new transaction using sourceTransaction as a base and amending properties as appropriate
 */
function _generateTransaction (externalId, sourceTransaction, billingInvoiceLicenceId, isCancellingInvoice) {
  const reissuedBillingTransactionId = randomUUID({ disableEntropyCache: true })

  return {
    ...sourceTransaction,
    isCredit: _determineIsCredit(sourceTransaction.isCredit, isCancellingInvoice),
    billingTransactionId: reissuedBillingTransactionId,
    externalId,
    billingInvoiceLicenceId
  }
}

/**
 * Returns `true` if the provided CM reissue response is a cancelling invoice
 */
function _isCancellingInvoice (chargingModuleReissueResponse) {
  return chargingModuleReissueResponse.rebilledType === 'C'
}

/**
 * Maps the provided CM invoice fields to their billing invoice equivalents
 */
function _mapChargingModuleInvoice (chargingModuleInvoice) {
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

/**
 * Updates the source invoice's rebilling state and original billing invoice id
 */
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

function _retrieveChargingModuleTransaction (chargingModuleLicence, id) {
  return chargingModuleLicence.transactions.find((transaction) => {
    return transaction.rebilledTransactionId === id
  })
}

function _retrieveChargingModuleLicence (chargingModuleInvoice, licenceRef) {
  return chargingModuleInvoice.licences.find((licence) => {
    return licence.licenceNumber === licenceRef
  })
}

/**
 * If a billing invoice exists for this combination of source invoice and CM reissue invoice then return it; otherwise,
 * generate it, store it and then return it.
 */
function _retrieveOrGenerateBillingInvoice (dataToReturn, sourceInvoice, reissueBillingBatch, chargingModuleReissueInvoice) {
  // Because we have nested iteration of source invoice and Charging Module reissue invoice, we need to ensure we have
  // a billing invoice for every combination of these, hence we search by both of their ids
  const existingBillingInvoice = dataToReturn.billingInvoices.find((invoice) => {
    return invoice.invoiceAccountId === sourceInvoice.invoiceAccountId &&
      invoice.externalId === chargingModuleReissueInvoice.id
  })

  if (existingBillingInvoice) {
    return existingBillingInvoice
  }

  const translatedChargingModuleInvoice = _mapChargingModuleInvoice(chargingModuleReissueInvoice)
  const generatedBillingInvoice = GenerateBillingInvoiceService.go(
    sourceInvoice,
    reissueBillingBatch.billingBatchId,
    sourceInvoice.financialYearEnding
  )

  // Construct our new billing invoice by taking the generated billing invoice and combining it with the mapped fields
  // from the CM invoice, then updating its `originalBillingInvoiceId` field
  const newBillingInvoice = {
    ...generatedBillingInvoice,
    ...translatedChargingModuleInvoice,
    originalBillingInvoiceId: sourceInvoice.billingInvoiceId
  }

  dataToReturn.billingInvoices.push(newBillingInvoice)

  return newBillingInvoice
}

/**
 * If a billing invoice licence exists for this invoice account id then return it; otherwise, generate it, store it and
 * then return it.
 */
function _retrieveOrGenerateBillingInvoiceLicence (dataToReturn, sourceInvoice, billingInvoiceId, sourceInvoiceLicence) {
  const existingBillingInvoiceLicence = dataToReturn.billingInvoiceLicences.find((invoice) => {
    return invoice.invoiceAccountId === sourceInvoice.invoiceAccountId
  })

  if (existingBillingInvoiceLicence) {
    return existingBillingInvoiceLicence
  }

  const newBillingInvoiceLicence = GenerateBillingInvoiceLicenceService.go(billingInvoiceId, sourceInvoiceLicence)

  dataToReturn.billingInvoiceLicences.push(newBillingInvoiceLicence)

  return newBillingInvoiceLicence
}

async function _sendReissueRequest (billingBatchExternalId, invoiceExternalId) {
  const result = await ChargingModuleReissueInvoiceService.go(billingBatchExternalId, invoiceExternalId)

  if (!result.succeeded) {
    const error = new Error('Charging Module reissue request failed')
    error.billingBatchExternalId = billingBatchExternalId
    error.invoiceExternalId = invoiceExternalId

    throw error
  }

  return result.response.invoices
}

async function _sendViewInvoiceRequest (billingBatch, reissueInvoice) {
  const result = await ChargingModuleViewInvoiceService.go(billingBatch.externalId, reissueInvoice.id)

  if (!result.succeeded) {
    const error = new Error('Charging Module view invoice request failed')
    error.billingBatchExternalId = billingBatch.externalId
    error.reissueInvoiceExternalId = reissueInvoice.id

    throw error
  }

  return result.response.invoice
}

module.exports = {
  go
}
