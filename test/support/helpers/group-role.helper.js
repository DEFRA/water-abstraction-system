'use strict'

/**
 * @module GroupRoleHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const GroupRoleModel = require('../../../app/models/group-role.model.js')

/**
 * Add a new group role
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `groupId` - [random UUID]
 * - `roleId` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:GroupRoleModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return GroupRoleModel.query()
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
    groupId: generateUUID(),
    roleId: generateUUID()
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
