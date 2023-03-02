'use strict'

/**
 * @module BillingTransactionHelper
 */

const BillingTransactionModel = require('../../../../app/models/water/billing-transaction.model.js')

/**
 * Add a new billing transaction
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billingInvoiceLicenceId` - 7190937e-e176-4d50-ae4f-c00c5e76938a
 * - `description` - River Beult at Boughton Monchelsea
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingTransactionModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillingTransactionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new record
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    billingInvoiceLicenceId: '7190937e-e176-4d50-ae4f-c00c5e76938a',
    description: 'River Beult at Boughton Monchelsea'
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
