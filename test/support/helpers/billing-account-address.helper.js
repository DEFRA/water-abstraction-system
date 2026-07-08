/**
 * @module BillingAccountAddressHelper
 */

import BillingAccountAddressModel from '../../../app/models/billing-account-address.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * Add a new billing account address
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `billingAccountId` - [random UUID]
 * - `addressId` - [random UUID]
 * - `startDate` - 2023-08-18
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:BillingAccountAddressModel>} The instance of the newly created record
 */
export function add(data = {}) {
  const insertData = defaults(data)

  return BillingAccountAddressModel.query()
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
    billingAccountId: generateUUID(),
    addressId: generateUUID(),
    startDate: new Date('2023-08-18')
  }

  return {
    ...defaults,
    ...data
  }
}
