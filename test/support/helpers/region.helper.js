'use strict'

/**
 * @module RegionHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Add a new region
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `charge_region_id` - S
 * - `nald_region_id` - 9
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {string} The ID of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  const result = await db.table('water.regions')
    .insert(insertData)
    .returning('region_id')

  return result
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
    charge_region_id: 'S',
    nald_region_id: 9
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
