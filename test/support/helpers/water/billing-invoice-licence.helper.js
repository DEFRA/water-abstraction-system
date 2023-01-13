'use strict'

/**
 * @module BillingInvoiceLicenceHelper
 */

const BillingInvoiceLicenceModel = require('../../../../app/models/water/billing-invoice-licence.model.js')
const LicenceHelper = require('./licence.helper.js')

/**
 * Add a new billing invoice licence
 *
 * A billing invoice licence is always linked to a licence. So, creating a billing invoice licence will automatically
 * create a new licence and handle linking the two together by `licenceId`.
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billingInvoiceId` - 7b6bf750-9a97-4a02-9807-e252a7755e44
 * - `licenceRef` - 01/123
 *
 * See `LicenceHelper` for the licence defaults
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 * @param {Object} [licence] Any licence data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingInvoiceLicenceModel} The instance of the newly created record
 */
async function add (data = {}, licence = {}) {
  const licenceId = await _licenceId(licence)

  const insertData = defaults({ ...data, licenceId })

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
    billingInvoiceId: '7b6bf750-9a97-4a02-9807-e252a7755e44',
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
