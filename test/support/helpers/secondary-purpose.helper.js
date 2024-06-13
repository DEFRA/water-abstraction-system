'use strict'

/**
 * @module PurposeHelper
 */

const SecondaryPurposeModel = require('../../../app/models/secondary-purpose.model.js')
const { randomInteger } = require('../general.js')

// NOTE: This is only a subset. There 63 of these codes that could be used. Taken from water.purposes_secondary
const SECONDARY_PURPOSES = [
  { code: 'AGR', description: 'General Agriculture' },
  { code: 'AQF', description: 'Aquaculture Fish' },
  { code: 'AQP', description: 'Aquaculture Plant' },
  { code: 'BRW', description: 'Breweries/Wine' },
  { code: 'BUS', description: 'Business Parks' },
  { code: 'CHE', description: 'Chemicals' },
  { code: 'CON', description: 'Construction' },
  { code: 'CRN', description: 'Crown And Government' },
  { code: 'DAR', description: 'Dairies' },
  { code: 'ELC', description: 'Electricity' },
  { code: 'EXT', description: 'Extractive' },
  { code: 'FAD', description: 'Food & Drink' },
  { code: 'FOR', description: 'Forestry' },
  { code: 'GOF', description: 'Golf Courses' },
  { code: 'HOL', description: 'Holiday Sites, Camp Sites & Tourist Attractions' },
  { code: 'HOS', description: 'Hospitals' },
  { code: 'PAD', description: 'Public Administration' },
  { code: 'PAP', description: 'Paper And Printing' },
  { code: 'PET', description: 'Petrochemicals' },
  { code: 'PRI', description: 'Private Non-Industrial' }
]

/**
 * Add a new secondary purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `legacyId` - [randomly selected - AGR]
 * - `description` - [randomly selected - General Agriculture]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:PurposeModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return SecondaryPurposeModel.query()
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
  const { code, description } = generateSecondaryPurpose()

  const defaults = {
    legacyId: data.legacyId ? data.legacyId : code,
    description: data.description ? data.description : description
  }

  return {
    ...defaults,
    ...data
  }
}

function generateSecondaryPurpose () {
  return SECONDARY_PURPOSES[randomInteger(0, 7)]
}

module.exports = {
  add,
  defaults,
  generateSecondaryPurpose
}
