'use strict'

/**
 * @module LicenceVersionPurposesHelper
 */

const { generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceVersionPurposeModel = require('../../../app/models/licence-version-purpose.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new licence version purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `abstractionPeriodStartDay` - [1]
 * - `abstractionPeriodStartMonth` - [1]
 * - `abstractionPeriodEndDay` - [31]
 * - `abstractionPeriodEndMonth` - [3]
 * - `externalId` - [randomly generated - 9:99999]
 * - `licenceVersionId` - [random UUID]
 * - `primaryPurposeId` - [random UUID]
 * - `purposeId` - [random UUID]
 * - `secondaryPurposeId` - [random UUID]
 * - `created` - new Date()
 * - `updated` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposeModel.query()
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
  const timestamp = timestampForPostgres()

  const defaults = {
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 1,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    externalId: generateLicenceVersionPurposeExternalId(),
    licenceVersionId: generateUUID(),
    primaryPurposeId: generateUUID(),
    purposeId: generateUUID(),
    secondaryPurposeId: generateUUID(),
    // INFO: The table does not have a default for the date columns
    createdAt: timestamp,
    updatedAt: timestamp
  }

  return {
    ...defaults,
    ...data
  }
}

function generateLicenceVersionPurposeExternalId () {
  return `${randomInteger(0, 9)}:${randomInteger(10000, 99999)}`
}

module.exports = {
  add,
  defaults,
  generateLicenceVersionPurposeExternalId
}
