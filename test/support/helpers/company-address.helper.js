/**
 * @module CompanyAddressHelper
 */

import CompanyAddressModel from '../../../app/models/company-address.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * Add a new company address
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `addressId` - [random UUID]
 * - `companyId` - [random UUID]
 * - `licenceRoleId` - [random UUID]
 * - `startDate` - 2022-04-01
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:CompanyAddressModel>} The instance of the newly created record
 */
export function add(data = {}) {
  const insertData = defaults(data)

  return CompanyAddressModel.query()
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
    addressId: generateUUID(),
    companyId: generateUUID(),
    licenceRoleId: generateUUID(),
    startDate: new Date('2022-04-01')
  }

  return {
    ...defaults,
    ...data
  }
}
