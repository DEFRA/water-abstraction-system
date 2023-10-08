'use strict'

/**
 * @module BillingHelper
 */

const BillModel = require('../../../../app/models/water/bill.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateInvoiceAccountNumber } = require('../crm-v2/invoice-account.helper.js')

/**
 * Add a new bill
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `invoiceAccountId` - [random UUID]
 * - `address` - {}
 * - `invoiceAccountNumber` - [randomly generated - T12345678A]
 * - `billingBatchId` - [random UUID]
 * - `financialYearEnding` - 2023
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillModel} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return BillModel.query()
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
    invoiceAccountId: generateUUID(),
    address: {},
    invoiceAccountNumber: generateInvoiceAccountNumber(),
    billingBatchId: generateUUID(),
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
