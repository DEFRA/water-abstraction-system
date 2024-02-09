'use strict'

/**
 * @module RoleHelper
 */

const RoleModel = require('../../../app/models/role.model.js')

/**
 * Add a new role
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `role` - billing
 * - `description` - Administer billing
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:RoleModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return RoleModel.query()
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
    role: 'billing',
    description: 'Administer billing'
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
