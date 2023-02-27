'use strict'

/**
 * @module InvoiceAccountHelper
 */

const InvoiceAccountModel = require('../../../../app/models/crm-v2/invoice-account.model.js')

/**
 * Add a new invoice account
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `invoiceAccountNumber` - T12345678A
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:InvoiceAccountModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return InvoiceAccountModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new region
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    invoiceAccountNumber: 'T12345678A'
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
