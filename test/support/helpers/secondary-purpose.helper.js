'use strict'

/**
 * @module SecondaryPurposeHelper
 */

const { randomInteger, selectRandomEntry } = require('../general.js')
const SecondaryPurposeModel = require('../../../app/models/secondary-purpose.model.js')
const SecondaryPurposes = require('../../../db/seeds/data/secondary-purposes.js')

const DEFAULT_INDEX = 0

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
  const defaults = select(DEFAULT_INDEX)

  return {
    ...defaults,
    ...data
  }
}

function generateSecondaryPurpose () {
  return SECONDARY_PURPOSES[randomInteger(0, 7)]
}

/**
 * Select an entry from the reference data entries seeded at the start of testing
 *
 * Because this helper is linked to a reference record instead of a transaction, we don't expect these to be created
 * when using the service.
 *
 * So, they are seeded automatically when tests are run. Tests that need to link to a record can use this method to
 * select a specific entry, or have it it return one at random.
 *
 * @param {Number} [index=-1] - The reference entry to select. Defaults to -1 which means an entry will be returned at
 * random from the reference data
 *
 * @returns {Object} The selected reference entry or one picked at random
 */
function select (index = -1) {
  if (index > -1) {
    return SecondaryPurposes.data[index]
  }

  return selectRandomEntry(SecondaryPurposes.data)
}

module.exports = {
  add,
  data: SecondaryPurposes.data,
  DEFAULT_INDEX,
  defaults,
  generateSecondaryPurpose,
  select
}
