'use strict'

/**
 * @module BillingInvoiceHelper
 */

const BillingInvoiceModel = require('../../../../app/models/water/billing-invoice.model.js')

/**
 * Add a new billing invoice
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `invoiceAccountId` - 396ee68f-d665-4770-b0ad-d70a007f9bd5
 * - `address` - {}
 * - `invoiceAccountNumber` - T12345678A
 * - `billingBatchId` - 1d9e3142-8893-4dff-9043-f4b3b34e230d
 * - `financialYearEnding` - 2023
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingInvoiceModel} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return BillingInvoiceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new billing invoice
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    invoiceAccountId: '396ee68f-d665-4770-b0ad-d70a007f9bd5',
    address: {},
    invoiceAccountNumber: 'T12345678A',
    billingBatchId: '1d9e3142-8893-4dff-9043-f4b3b34e230d',
    financialYearEnding: 2023
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
