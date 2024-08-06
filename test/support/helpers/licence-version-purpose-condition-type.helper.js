'use strict'

/**
 * @module LicenceVersionPurposeConditionTypeHelper
 */

const { selectRandomEntry } = require('../general.js')
const LicenceVersionPurposeConditionTypeModel = require('../../../app/models/licence-version-purpose-condition-type.model.js')
const LicenceVersionPurposeConditionTypes = require('../../../db/seeds/data/licence-version-purpose-condition-types.js')

const DEFAULT_INDEX = 0

/**
 * Add a new licence version purpose condition type
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `code` - COMB
 * - `subcode` - LINK
 * - `description` - Condition To Indicate Licence  Split On Nald
 * - `subcodeDescription` - Link Between Split Licences
 * - `displayTitle` - Link between split licences
 * - `createdAt` - new Date()
 * - `updatedAt` - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeConditionTypeModel>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposeConditionTypeModel.query()
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
    return LicenceVersionPurposeConditionTypes.data[index]
  }

  return selectRandomEntry(LicenceVersionPurposeConditionTypes.data)
}

module.exports = {
  add,
  data: LicenceVersionPurposeConditionTypes.data,
  DEFAULT_INDEX,
  defaults,
  select
}
