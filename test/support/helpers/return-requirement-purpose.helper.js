'use strict'

/**
 * @module ReturnRequirementPurposeHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { randomInteger, selectRandomEntry } = require('../general.js')
const PrimaryPurposeHelper = require('./primary-purpose.helper.js')
const PurposeHelper = require('./purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../../app/models/return-requirement-purpose.model.js')
const SecondaryPurposes = require('../../../db/seeds/data/secondary-purposes.js')

/**
 * Add a new return requirement purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999:A:AGR:400]
 * - `purposeId` - [randomly selected UUID from purposes]
 * - `primaryPurposeId` - [randomly selected UUID from primary purposes]
 * - `secondaryPurposeId` - [randomly selected UUID from secondary purposes]
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
  const purpose = PurposeHelper.select()
  const primaryPurpose = PrimaryPurposeHelper.select()
  const secondaryPurpose = selectRandomEntry(SecondaryPurposes.data)

  const externalId = `9:${randomInteger(100, 99999)}:${primaryPurpose.legacyId}:${secondaryPurpose.legacyId}:${purpose.legacyId}`

  const defaults = {
    externalId,
    purposeId: purpose.id,
    primaryPurposeId: primaryPurpose.id,
    secondaryPurposeId: secondaryPurpose.id,
    returnRequirementId: generateUUID()
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
