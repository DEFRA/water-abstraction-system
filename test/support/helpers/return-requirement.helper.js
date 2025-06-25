'use strict'

/**
 * @module ReturnRequirementHelper
 */

const { generateRandomInteger, generateUUID } = require('../../../app/lib/general.lib.js')
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
 * - `returnsFrequency` - day
 * - `returnVersionId` - [random UUID]
 * - `siteDescription` - BOREHOLE AT AVALON
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnRequirementModel>} The instance of the newly created record
 */
function add(data = {}) {
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
function defaults(data = {}) {
  const defaults = {
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    returnsFrequency: 'day',
    returnVersionId: generateUUID(),
    siteDescription: 'BOREHOLE AT AVALON'
  }

  const returnRequirement = {
    ...defaults,
    ...data
  }

  delete returnRequirement.regionId

  return returnRequirement
}

/**
 * Generates a return requirement reference
 *
 * @returns {number}
 */
function generateReference() {
  return generateRandomInteger(10000000, 99999999)
}

module.exports = {
  add,
  defaults,
  generateReference
}
