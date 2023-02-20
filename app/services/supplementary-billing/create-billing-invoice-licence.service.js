'use strict'

/**
 * Creates a billing invoice licence record
 *
 * @module CreateBillingInvoiceLicenceService
 */

const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')

/**
 * Create a billing invoice licence record for the provided billing invoice and licence
 *
 * @param {module:BillingInvoiceModel} billingInvoice An instance of `BillingInvoiceModel`
 * @param {module:licenceModel} licence An instance of `LicenceModel`
 *
 * @returns {Object} The newly-created billing invoice licence record
 */
async function go (billingInvoice, licence) {
  const event = await BillingInvoiceLicenceModel.query()
    .insert({
      billingInvoiceId: billingInvoice.billingInvoiceId,
      licenceRef: licence.licenceRef,
      licenceId: licence.licenceId
    })
    .returning('*')

  return event
}

module.exports = {
  go
}
