'use strict'

/**
 * Generates a billing invoice licence record ready for persisting
 * @module CreateBillingInvoiceLicenceService
 */

const { randomUUID } = require('crypto')

/**
 * Create a billing invoice licence record for the provided billing invoice and licence
 *
 * @param {module:BillingInvoiceModel} billingInvoice An instance of `BillingInvoiceModel`
 * @param {module:licenceModel} licence An instance of `LicenceModel`
 *
 * @returns {Object} The newly-created billing invoice licence record
 */
function go (generatedBillingInvoiceLicences, billingInvoiceId, licence) {
  let billingInvoiceLicence = _existing(generatedBillingInvoiceLicences, billingInvoiceId)

  if (billingInvoiceLicence) {
    return {
      billingInvoiceLicence,
      billingInvoiceLicences: generatedBillingInvoiceLicences
    }
  }

  billingInvoiceLicence = {
    billingInvoiceId,
    billingInvoiceLicenceId: randomUUID({ disableEntropyCache: true }),
    licenceRef: licence.licenceRef,
    licenceId: licence.licenceId
  }
  const updatedBillingInvoiceLicences = [...generatedBillingInvoiceLicences, billingInvoiceLicence]

  return {
    billingInvoiceLicence,
    billingInvoiceLicences: updatedBillingInvoiceLicences
  }
}

function _existing (generatedBillingInvoiceLicences, billingInvoiceId) {
  return generatedBillingInvoiceLicences.filter((invoiceLicence) => {
    return billingInvoiceId === invoiceLicence.billingInvoiceId
  })[0]
}

module.exports = {
  go
}
