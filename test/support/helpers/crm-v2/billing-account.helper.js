'use strict'

/**
 * @module BillingAccountHelper
 */

const { randomInteger } = require('../general.helper.js')
const BillingAccountModel = require('../../../../app/models/crm-v2/billing-account.model.js')

/**
 * Add a new billing account
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `invoiceAccountNumber` - [randomly generated - T12345678A]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingAccountModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillingAccountModel.query()
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
    invoiceAccountNumber: generateInvoiceAccountNumber()
  }

  return {
    ...defaults,
    ...data
  }
}

function generateInvoiceAccountNumber () {
  const numbering = randomInteger(10000000, 99999999)

  return `T${numbering}A`
}

module.exports = {
  add,
  defaults,
  generateInvoiceAccountNumber
}
