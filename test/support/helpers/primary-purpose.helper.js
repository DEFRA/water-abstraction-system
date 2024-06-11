'use strict'

/**
 * @module PurposeHelper
 */

const PrimaryPurposeModel = require('../../../app/models/primary-purpose.model.js')
const { randomInteger } = require('../general.js')

// NOTE: Taken from water.purposes_primary
const PRIMARY_PURPOSES = [
  { code: 'A', description: 'Agriculture' },
  { code: 'E', description: 'Environmental' },
  { code: 'I', description: 'Industrial, Commercial And Public Services' },
  { code: 'M', description: 'Amenity' },
  { code: 'P', description: 'Production Of Energy' },
  { code: 'W', description: 'Water Supply' },
  { code: 'X', description: 'Impounding' },
  { code: 'C', description: 'Crown And Government' }
]

/**
 * Add a new primary purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `legacyId` - [randomly selected - A]
 * - `description` - [randomly selected - Agriculture]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:PurposeModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return PrimaryPurposeModel.query()
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
  const { code, description } = generatePrimaryPurpose()

  const defaults = {
    legacyId: data.legacyId ? data.legacyId : code,
    description: data.description ? data.description : description
  }

  return {
    ...defaults,
    ...data
  }
}

function generatePrimaryPurpose () {
  return PRIMARY_PURPOSES[randomInteger(0, 7)]
}

module.exports = {
  add,
  defaults,
  generatePrimaryPurpose
}
