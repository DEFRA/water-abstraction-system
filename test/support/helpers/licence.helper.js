'use strict'

/**
 * @module LicenceHelper
 */

const { db } = require('../../../db/db.js')

/**
 * Add a new licence
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licence_ref` - 01/123
 * - `region_id` - bd114474-790f-4470-8ba4-7b0cc9c225d7
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {string} The ID of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  const result = await db.table('water.licences')
    .insert(insertData)
    .returning('licence_id')

  return result
}

/**
 * Returns the defaults used when creating a new licence
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    licence_ref: '01/123',
    region_id: 'bd114474-790f-4470-8ba4-7b0cc9c225d7'
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
