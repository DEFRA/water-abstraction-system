'use strict'

/**
 * @module BillingInvoiceLicenceHelper
 */

const BillingInvoiceLicenceModel = require('../../../../app/models/water/billing-invoice-licence.model.js')

/**
 * Add a new billing invoice licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billingInvoiceId` - 7b6bf750-9a97-4a02-9807-e252a7755e44
 * - `licenceRef` - 01/123
 * - `licenceId` - 621c61b4-e9c4-4165-b005-379488f7b941
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingInvoiceLicenceModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillingInvoiceLicenceModel.query()
    .insert({ ...insertData })
    .returning('*')
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
    licenceRef: '01/123',
    licenceId: '621c61b4-e9c4-4165-b005-379488f7b941'
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
