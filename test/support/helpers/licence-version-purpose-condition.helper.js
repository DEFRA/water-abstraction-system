'use strict'

/**
 * @module LicenceVersionPurposeConditionHelper
 */

const { generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceVersionPurposeConditionModel = require('../../../app/models/licence-version-purpose-condition.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new licence version purpose condition
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceVersionPurposeConditionId` - [random UUID]
 * - `licenceVersionPurposeId` - [random UUID]
 * - `licenceVersionPurposeConditionTypeId` - [random UUID]
 * - `externalId` - [9:${randomInteger(10000, 99999)}:1:0]
 * - `source` - [nald]
 * - `dateCreated` - new Date()
 * - `dateUpdated` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeConditionsModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposeConditionModel.query()
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
    licenceVersionPurposeId: generateUUID(),
    licenceVersionPurposeConditionTypeId: generateUUID(),
    externalId: `9:${randomInteger(10000, 99999)}:1:0`,
    source: 'nald',
    createdAt: timestamp,
    updatedAt: timestamp
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
