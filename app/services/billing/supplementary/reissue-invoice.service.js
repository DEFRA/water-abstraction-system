'use strict'

/**
 * Handles the reissuing of a single invoice
 * @module ReissueInvoiceService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

const ChargingModuleBillRunStatusService = require('../../charging-module/bill-run-status.service.js')
const ChargingModuleReissueInvoiceService = require('../../charging-module/reissue-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../../charging-module/view-invoice.service.js')
const ExpandedError = require('../../../errors/expanded.error.js')
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
 * @param {module:BillingInvoiceModel} sourceInvoice The invoice to be reissued. Note that we expect it to include the
 * billing invoice licences and transactions
 * @param {module:BillRunModel} reissueBillRun The bill run that the new invoices should belong to
 *
 * @returns {Object} dataToReturn Data that has been generated while reissuing the invoice
 * @returns {Object[]} dataToReturn.billingInvoices Array of billing invoices
 * @returns {Object[]} dataToReturn.billingInvoiceLicences Array of billing invoice licences
 * @returns {Object[]} dataToReturn.billingTransactions Array of transactions
 */

async function go (sourceInvoice, reissueBillRun) {
  const dataToReturn = {
    billingInvoices: [],
    billingInvoiceLicences: [],
    billingTransactions: []
  }

  // When a reissue request is sent to the Charging Module, it creates 2 new invoices (one to cancel out the original
  // invoice and one to be the new version of it) and returns their ids
  const chargingModuleReissueInvoiceIds = await _sendReissueRequest(
    reissueBillRun.externalId,
    sourceInvoice.externalId
  )

  // We can't get the reissue invoices right away as the CM might be busy reissuing so we wait until the status
  // indicated that it's ready for us to proceed
  await _pauseUntilNotPending(reissueBillRun.externalId)

  for (const chargingModuleReissueInvoiceId of chargingModuleReissueInvoiceIds) {
    // Because we only have the CM invoice's id we now need to fetch its details via the "view invoice" endpoint
    const chargingModuleReissueInvoice = await _sendViewInvoiceRequest(
      reissueBillRun,
      chargingModuleReissueInvoiceId
    )

    const reissueBillingInvoice = _retrieveOrGenerateBillingInvoice(
      dataToReturn,
      sourceInvoice,
      reissueBillRun,
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

        const reissueTransaction = _generateTransaction(
          chargingModuleReissueTransaction,
          sourceTransaction,
          reissueInvoiceLicence.billingInvoiceLicenceId
        )

        dataToReturn.billingTransactions.push(reissueTransaction)
      }
    }
  }

  await _markSourceInvoiceAsRebilled(sourceInvoice)

  return dataToReturn
}

/**
 * Once a reissue request is sent, we need to wait until it's completed before we can proceed. The CM indicates that
 * it's busy by setting the status `pending` on a bill run. Once the status is no longer `pending`, the CM has finished
 * its task.
 *
 * This service sends "view status" requests to the CM (every second to avoid bombarding it) until the status is not
 * `pending`, at which point it returns.
 */
async function _pauseUntilNotPending (billRunExternalId) {
  let status

  do {
    // If status is set then we know that we've already sent a request, so we wait for a second to ensure we aren't
    // bombarding the CM with requests
    if (status) {
      // Create a new promise that resolves after 1000ms and wait until it's resolved before continuing
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const result = await ChargingModuleBillRunStatusService.go(billRunExternalId)

    if (!result.succeeded) {
      const error = new ExpandedError(
        'Charging Module reissue request failed',
        { billRunExternalId, responseBody: result.response.body }
      )

      throw error
    }

    status = result.response.body.status
  } while (status === 'pending')
}

/**
 * Generates a new transaction using sourceTransaction as a base and amending properties as appropriate
 */
function _generateTransaction (chargingModuleReissueTransaction, sourceTransaction, billingInvoiceLicenceId) {
  return {
    ...sourceTransaction,
    billingTransactionId: generateUUID(),
    externalId: chargingModuleReissueTransaction.id,
    isCredit: chargingModuleReissueTransaction.credit,
    netAmount: _determineSignOfNetAmount(
      chargingModuleReissueTransaction.chargeValue,
      chargingModuleReissueTransaction.credit
    ),
    billingInvoiceLicenceId
  }
}

/**
 * The Charging Module always returns a positive value for net amount whereas our db has a positive amount for debits
 * and a negative value for credits. We therefore use the CM charge value and credit flag to determine whether our net
 * amount should be positive or negative
 */
function _determineSignOfNetAmount (chargeValue, credit) {
  return credit ? -chargeValue : chargeValue
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
function _retrieveOrGenerateBillingInvoice (dataToReturn, sourceInvoice, reissueBillRun, chargingModuleReissueInvoice) {
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
    reissueBillRun.billingBatchId,
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

async function _sendReissueRequest (billRunExternalId, invoiceExternalId) {
  const result = await ChargingModuleReissueInvoiceService.go(billRunExternalId, invoiceExternalId)

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module reissue request failed',
      {
        billRunExternalId,
        invoiceExternalId,
        responseBody: result.response.body
      }
    )

    throw error
  }

  // The CM returns a few bits of info but we only need the id
  return result.response.body.invoices.map((invoice) => {
    return invoice.id
  })
}

async function _sendViewInvoiceRequest (billRun, reissueInvoiceId) {
  const result = await ChargingModuleViewInvoiceService.go(billRun.externalId, reissueInvoiceId)

  if (!result.succeeded) {
    const error = new ExpandedError(
      'Charging Module view invoice request failed',
      {
        billRunExternalId: billRun.externalId,
        reissueInvoiceExternalId: reissueInvoiceId,
        responseBody: result.response.body
      }
    )

    throw error
  }

  return result.response.body.invoice
}

module.exports = {
  go
}
