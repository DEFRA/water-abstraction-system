'use strict'

/**
 * @module LicenceVersionPurposeConditionHelper
 */

const { generateRandomInteger, generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceVersionPurposeConditionModel = require('../../../app/models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeConditionTypeHelper = require('./licence-version-purpose-condition-type.helper.js')

/**
 * Add a new licence version purpose condition
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceVersionPurposeConditionId` - [random UUID]
 * - `licenceVersionPurposeId` - [random UUID]
 * - `licenceVersionPurposeConditionTypeId` - [randomly selected UUID from licence version purpose condition types]
 * - `externalId` - [9:${generateRandomInteger(10000, 99999)}:1:0]
 * - `source` - [nald]
 * - `dateCreated` - new Date()
 * - `dateUpdated` - new Date()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeConditionModel>} The instance of the newly created record
 */
async function add(data = {}) {
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
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults(data = {}) {
  const { id: licenceVersionPurposeConditionTypeId } = LicenceVersionPurposeConditionTypeHelper.select()
  const timestamp = timestampForPostgres()

  const defaults = {
    licenceVersionPurposeId: generateUUID(),
    licenceVersionPurposeConditionTypeId,
    externalId: `9:${generateRandomInteger(10000, 99999)}:1:0`,
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
