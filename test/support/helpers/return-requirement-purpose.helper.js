'use strict'

/**
 * @module ReturnRequirementPurposeHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { randomInteger } = require('../general.js')
const { generatePrimaryPurpose } = require('./primary-purpose.helper.js')
const { generatePurposeCode } = require('./purpose.helper.js')
const { generateSecondaryPurpose } = require('./secondary-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../../app/models/return-requirement-purpose.model.js')

/**
 * Add a new return requirement purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999:A:AGR:400]
 * - `purposeId` - [random UUID]
 * - `primaryPurposeId` - [random UUID]
 * - `secondaryPurposeId` - [random UUID]
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
    primaryPurposeId: generateUUID(),
    secondaryPurposeId: generateUUID(),
    returnRequirementId: generateUUID()
  }

  return {
    ...defaults,
    ...data
  }
}

function _generatePrimaryCode () {
  return generatePrimaryPurpose().code
}

function _generateSecondaryCode () {
  return generateSecondaryPurpose().code
}

module.exports = {
  add,
  defaults
}
