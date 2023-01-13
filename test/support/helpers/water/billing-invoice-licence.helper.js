'use strict'

/**
 * @module BillingInvoiceLicenceHelper
 */

const BillingInvoiceHelper = require('./billing-invoice.helper.js')
const BillingInvoiceLicenceModel = require('../../../../app/models/water/billing-invoice-licence.model.js')
const LicenceHelper = require('./licence.helper.js')

/**
 * Add a new billing invoice licence
 *
 * A billing invoice licence is always linked to a licence and a billing invoice. So, creating a billing invoice licence will automatically
 * create a new licence, a new billing invoice and handle linking them together by `licenceId` & `billingInvoiceId`.
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - 01/123
 *
 * See `LicenceHelper` for the licence defaults
 * See `BillingInvoiceHelper` for the billing invoice defaults
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 * @param {Object} [licence] Any licence data you want to use instead of the defaults used here or in the database
 * @param {Object} [billingInvoice] Any billing invoice data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingInvoiceLicenceModel} The instance of the newly created record
 */
async function add (data = {}, licence = {}, billingInvoice = {}) {
  const licenceId = await _licenceId(licence)
  const billingInvoiceId = await _billingInvoiceId(billingInvoice)

  const insertData = defaults({ ...data, licenceId, billingInvoiceId })

  return BillingInvoiceLicenceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

async function _licenceId (providedLicence) {
  if (providedLicence?.licenceId) {
    return providedLicence.licenceId
  }

  const licence = await LicenceHelper.add(providedLicence)

  return licence.licenceId
}

async function _billingInvoiceId (providedBillingInvoice) {
  if (providedBillingInvoice?.billingInvoiceId) {
    return providedBillingInvoice.billingInvoiceId
  }

  const billingInvoice = await BillingInvoiceHelper.add(providedBillingInvoice)

  return billingInvoice.billingInvoiceId
}

/**
 * Returns the defaults used when creating a new billing invoice licence
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    licenceRef: '01/123'
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add,
  defaults
}
