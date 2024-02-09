'use strict'

/**
 * @module LicenceVersionPurposesHelper
 */

const { generateUUID, timestampForPostgres } = require('../../../app/lib/general.lib.js')
const LicenceVersionPurposesModel = require('../../../app/models/licence-version-purpose.model.js')
const { randomInteger } = require('./general.helper.js')

/**
 * Add a new licence version purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceVersionPurposeId` - [random UUID]
 * - `licenceVersionId` - [random UUID]
 * - `purposePrimaryId` - [random UUID]
 * - `purposeSecondaryId` - [random UUID]
 * - `purposeUseId` - [random UUID]
 * - `abstractionPeriodStartDay` - [1]
 * - `abstractionPeriodStartMonth` - [1]
 * - `abstractionPeriodEndDay` - [31]
 * - `abstractionPeriodEndMonth` - [3]
 * - `dateCreated` - new Date()
 * - `dateUpdated` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposesModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposesModel.query()
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
    annualQuantity: 1000,
    createdAt: timestamp,
    updatedAt: timestamp,
    externalId: `9:${randomInteger(10000, 99999)}:1:0`,
    licenceVersionId: generateUUID(),
    purposePrimaryId: generateUUID(),
    purposeSecondaryId: generateUUID(),
    purposeId: generateUUID()
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
