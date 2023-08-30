'use strict'

/**
 * @module GroupRoleHelper
 */

const GroupRoleModel = require('../../../../app/models/idm/group-role.model.js')

/**
 * Add a new group role
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `groupId` - e814fc07-e6e3-4a50-8699-9ede17690674
 * - `roleId` - 66b54ff8-edec-417a-8c8b-48d98aad3843
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
 * Returns the defaults used when creating a new record
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    groupId: 'e814fc07-e6e3-4a50-8699-9ede17690674',
    roleId: '66b54ff8-edec-417a-8c8b-48d98aad3843'
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
