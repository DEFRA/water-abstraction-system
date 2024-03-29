'use strict'

/**
 * @module GroupHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const GroupModel = require('../../../app/models/group.model.js')

/**
 * Add a new group
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `group` - wirs
 * - `description` - Waste Industry Regulatory Services
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:GroupModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return GroupModel.query()
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
  const defaults = {
    // We create a random uuid as the id is NOT generated by the db, unlike most other tables
    id: generateUUID(),
    group: 'wirs',
    description: 'Waste Industry Regulatory Services'
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
