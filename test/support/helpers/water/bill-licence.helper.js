'use strict'

/**
 * @module BillLicenceHelper
 */

const BillLicenceModel = require('../../../../app/models/water/bill-licence.model.js')

/**
 * Add a new bill licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billingInvoiceId` - 45f08fe4-5b8b-4cf7-aaf0-5a07534e1357
 * - `licenceRef` - 01/123
 * - `licenceId` - 2eb0623e-30c6-4bf4-9598-2d60a8366c7d
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillLicenceModel} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return BillLicenceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    billingInvoiceId: '45f08fe4-5b8b-4cf7-aaf0-5a07534e1357',
    licenceRef: '01/123',
    licenceId: '2eb0623e-30c6-4bf4-9598-2d60a8366c7d'
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
