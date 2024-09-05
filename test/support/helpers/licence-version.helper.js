'use strict'

/**
 * @module LicenceVersionHelper
 */

const { generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new licence version
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceId` - [random UUID]
 * - `issue` - 1
 * - `increment` - 0
 * - `status` - 'current'
 * - `startDate` - new Date('2022-01-01')
 * - `externalId` - [randomly generated - 9:99999:1:0]
 * - `createdAt` - new Date()
 * - `updatedAt` - new Date()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionModel.query()
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
  const timestamp = timestampForPostgres()

  const defaults = {
    licenceId: generateUUID(),
    issue: 1,
    increment: 0,
    status: 'current',
    startDate: new Date('2022-01-01'),
    externalId: generateLicenceVersionExternalId(),
    createdAt: timestamp,
    updatedAt: timestamp
  }

  return {
    ...defaults,
    ...data
  }
}

function generateLicenceVersionExternalId () {
  return `${randomInteger(0, 9)}:${randomInteger(10000, 99999)}:1:0`
}

module.exports = {
  add,
  defaults,
  generateLicenceVersionExternalId
}
