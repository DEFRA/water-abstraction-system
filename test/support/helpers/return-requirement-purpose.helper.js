'use strict'

/**
 * @module ReturnRequirementPurposeHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { randomInteger } = require('../general.js')
const { generatePurposeCode } = require('./purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../../app/models/return-requirement-purpose.model.js')

/**
 * Add a new return requirement purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999:A:AGR:400]
 * - `purposeId` - [random UUID]
 * - `purposePrimaryId` - [random UUID]
 * - `purposeSecondaryId` - [random UUID]
 * - `returnRequirementId` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnRequirementPurposeModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnRequirementPurposeModel.query()
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
  const externalId = `9:${randomInteger(100, 99999)}:${_generatePrimaryCode()}:${_generateSecondaryCode()}:${generatePurposeCode()}`

  const defaults = {
    externalId,
    purposeId: generateUUID(),
    purposePrimaryId: generateUUID(),
    purposeSecondaryId: generateUUID(),
    returnRequirementId: generateUUID()
  }

  return {
    ...defaults,
    ...data
  }
}

function _generatePrimaryCode () {
  // NOTE: Taken from water.purposes_primary
  const codes = ['A', 'E', 'I', 'M', 'P', 'W', 'X', 'C']

  return codes[randomInteger(0, 7)]
}

function _generateSecondaryCode () {
  // NOTE: This is only a subset. There 63 of these codes that could be used. Taken from water.purposes_secondary
  const codes = ['AGR', 'AQF', 'AQP', 'BRW', 'BUS', 'CHE', 'CON', 'CRN', 'DAR', 'ELC', 'EXT', 'FAD', 'FOR', 'GOF']

  return codes[randomInteger(0, 13)]
}

module.exports = {
  add,
  defaults
}
