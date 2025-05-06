'use strict'

/**
 * @module ReturnVersionHelper
 */

const { randomRegionCode } = require('../general.js')
const { generateRandomInteger, generateUUID } = require('../../../app/lib/general.lib.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

/**
 * Add a new return version
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999:100]
 * - `licenceId` - [random UUID]
 * - `reason` - new-licence
 * - `startDate` - 2022-04-01
 * - `status` - current
 * - `version` - 100
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnVersionModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return ReturnVersionModel.query()
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
function defaults(data = {}) {
  const version = data.version ? data.version : 100

  const defaults = {
    externalId: `${randomRegionCode()}:${generateRandomInteger(100, 99999)}:${version}`,
    licenceId: generateUUID(),
    reason: 'new-licence',
    startDate: new Date('2022-04-01'),
    status: 'current',
    version
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
