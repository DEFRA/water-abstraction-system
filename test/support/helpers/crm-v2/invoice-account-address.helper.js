'use strict'

/**
 * @module InvoiceAccountAddressHelper
 */

const InvoiceAccountAddressModel = require('../../../../app/models/crm-v2/invoice-account-address.model.js')

/**
 * Add a new invoice account address
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `invoiceAccountId` - b16efa32-9271-4333-aecf-b9358ba42892
 * - `addressId` - 9570acde-752e-456a-a895-7b46a3c923a3
 * - `startDate` - 2023-08-18
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:InvoiceAccountAddressModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return InvoiceAccountAddressModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new invoice account address
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    invoiceAccountId: 'b16efa32-9271-4333-aecf-b9358ba42892',
    addressId: '9570acde-752e-456a-a895-7b46a3c923a3',
    startDate: new Date(2023, 9, 18)
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
