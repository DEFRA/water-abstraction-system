'use strict'

/**
 * @module RegionHelper
 */

const { selectRandomEntry } = require('../general.js')
const RegionModel = require('../../../app/models/region.model.js')
const Regions = require('../../../db/seeds/data/regions.js')

const TEST_REGION_INDEX = 8

/**
 * Add a new region
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeRegionId` - [selected based on randomly generated naldRegionId]
 * - `naldRegionId` - [randomly generated - 8]
 * - `name` - Kingdom of Avalon
 * - `displayName` - Avalon
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:RegionModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return RegionModel.query()
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
  const defaults = select(TEST_REGION_INDEX)

  return {
    ...defaults,
    ...data
  }
}

function select (index = -1) {
  if (index > -1) {
    return Regions.data[index]
  }

  return selectRandomEntry(Regions.data)
}

module.exports = {
  add,
  data: Regions.data,
  defaults,
  select,
  TEST_REGION_INDEX
}
