/**
 * @module ChargeVersionHelper
 */

import ChargeVersionModel from '../../../app/models/charge-version.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import { generateLicenceRef } from './licence.helper.js'

/**
 * Add a new charge version
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - [randomly generated - 01/123]
 * - `scheme` - sroc
 * - `versionNumber` - 1
 * - `startDate` - 2022-04-01
 * - `regionCode` - 1
 * - `source` - wrls
 * - `billingAccountId` - [random UUID]
 * - `status` - current
 * - `licenceId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ChargeVersionModel>} The instance of the newly created record
 */
export async function add(data = {}) {
  const insertData = defaults(data)

  return ChargeVersionModel.query()
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
    licenceRef: generateLicenceRef(),
    scheme: 'sroc',
    versionNumber: 1,
    startDate: new Date('2022-04-01'),
    regionCode: 1,
    source: 'wrls',
    billingAccountId: generateUUID(),
    status: 'current',
    licenceId: generateUUID()
  }

  return {
    ...defaults,
    ...data
  }
}
