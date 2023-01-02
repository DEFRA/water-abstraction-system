'use strict'

/**
 * @module RegionHelper
 */

const RegionModel = require('../../../app/models/region.model.js')

/**
 * Add a new region
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeRegionId` - S
 * - `naldRegionId` - 9
 * - `name` - Sroc Supplementary Bill (Test)
 * - `displayName` - Sroc Test
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:RegionModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return RegionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new region
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    chargeRegionId: 'S',
    naldRegionId: 9,
    name: 'Sroc Supplementary Bill (Test)',
    displayName: 'Sroc Test'
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
