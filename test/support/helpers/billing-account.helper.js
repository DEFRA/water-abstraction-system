'use strict'

/**
 * @module BillingAccountHelper
 */

const { randomInteger } = require('../general.js')
const BillingAccountModel = require('../../../app/models/billing-account.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new billing account
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `accountNumber` - [randomly generated - T12345678A]
 * - `companyId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillingAccountModel>} The instance of the newly created record
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
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const defaults = {
    accountNumber: generateAccountNumber(),
    companyId: generateUUID()
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Generates a random account number
 *
 * The account number is in the format 'T########A', where '#' is a digit.
 *
 * @returns {string} - The generated account number
 */
function generateAccountNumber () {
  const numbering = randomInteger(10000000, 99999999)

  return `T${numbering}A`
}

module.exports = {
  add,
  defaults,
  generateAccountNumber
}
