'use strict'

/**
 * @module PurposeHelper
 */

const { randomInteger, selectRandomEntry } = require('../general.js')
const PrimaryPurposeModel = require('../../../app/models/primary-purpose.model.js')
const PrimaryPurposes = require('../../../db/seeds/data/primary-purposes.js')

const DEFAULT_INDEX = 0

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
  const defaults = select(DEFAULT_INDEX)

  return {
    ...defaults,
    ...data
  }
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
    return PrimaryPurposes.data[index]
  }

  return selectRandomEntry(PrimaryPurposes.data)
}

function generatePrimaryPurpose () {
  return PRIMARY_PURPOSES[randomInteger(0, 7)]
}

module.exports = {
  add,
  data: PrimaryPurposes.data,
  DEFAULT_INDEX,
  defaults,
  generatePrimaryPurpose,
  select
}
