'use strict'

/**
 * @module RegionHelper
 */

const { randomInteger } = require('./general.helper.js')
const RegionModel = require('../../../app/models/region.model.js')

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
 * @returns {module:RegionModel} The instance of the newly created record
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
  const naldRegionId = randomInteger(1, 8)
  const defaults = {
    chargeRegionId: _chargeRegionId(naldRegionId),
    naldRegionId,
    name: 'Kingdom of Avalon',
    displayName: 'Avalon'
  }

  return {
    ...defaults,
    ...data
  }
}

function _chargeRegionId (naldRegionId) {
  const chargeRegionIds = ['A', 'B', 'Y', 'N', 'E', 'S', 'T', 'W']

  return chargeRegionIds[naldRegionId - 1]
}

module.exports = {
  add,
  defaults
}
