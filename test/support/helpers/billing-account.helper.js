/**
 * @module BillingAccountHelper
 */

import BillingAccountModel from '../../../app/models/billing-account.model.js'
import { generateRandomInteger, generateUUID } from '../../../app/lib/general.lib.js'

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
export function add(data = {}) {
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
export function defaults(data = {}) {
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
export function generateAccountNumber() {
  const numbering = generateRandomInteger(10000000, 99999999)

  return `T${numbering}A`
}
