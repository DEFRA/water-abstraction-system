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
 * - `billingBatchId` - f2fdcf4b-de93-4079-bae6-9247f2ecec57
 * - `financialYearEnding` - 2023
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingInvoiceModel} The instance of the newly created record
 */
function add (data = {}) {
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
    billingBatchId: 'f2fdcf4b-de93-4079-bae6-9247f2ecec57',
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
