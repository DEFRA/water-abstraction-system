'use strict'

/**
 * @module ReturnRequirementHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { randomInteger } = require('../general.js')
const ReturnRequirementModel = require('../../../app/models/return-requirement.model.js')

/**
 * Add a new return requirement
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `abstractionPeriodStartDay` - 1
 * - `abstractionPeriodStartMonth` - 4
 * - `abstractionPeriodEndDay` - 31
 * - `abstractionPeriodEndMonth` - 3
 * - `externalId` - [randomly generated - 9:99999]
 * - `legacyId` - [randomly generated - 99999]
 * - `returnsFrequency` - day
 * - `returnVersionId` - [random UUID]
 * - `siteDescription` - BOREHOLE AT AVALON
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnRequirementModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnRequirementModel.query()
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
  const legacyId = data.legacyId ? data.legacyId : randomInteger(100, 99999)

  const defaults = {
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    externalId: `9:${legacyId}`,
    legacyId,
    returnsFrequency: 'day',
    returnVersionId: generateUUID(),
    siteDescription: 'BOREHOLE AT AVALON'
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
