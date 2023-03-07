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
  // TODO: REFACTOR THIS TO UPSERT INSTEAD OF RETRIEVE AND RETURN EXISTING
  const retrievedBillingInvoiceLicence = await BillingInvoiceLicenceModel.query()
    .where('billingInvoiceId', billingInvoice.billingInvoiceId)
    .where('licenceId', licence.licenceId)
    .limit(1)
    .first()

  if (retrievedBillingInvoiceLicence) {
    return retrievedBillingInvoiceLicence
  }

  const billingInvoiceLicence = await BillingInvoiceLicenceModel.query()
    .insert({
      billingInvoiceId: billingInvoice.billingInvoiceId,
      licenceRef: licence.licenceRef,
      licenceId: licence.licenceId
    })
    .returning('*')

  return billingInvoiceLicence
}

module.exports = {
  go
}
