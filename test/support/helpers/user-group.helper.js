'use strict'

/**
 * @module UserGroupHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateUserId } = require('./user.helper.js')
const UserGroupModel = require('../../../app/models/user-group.model.js')

/**
 * Add a new user group
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `userId` - [randomly generated - 100001]
 * - `groupId` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:UserGroupModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return UserGroupModel.query()
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
    userId: generateUserId(),
    groupId: generateUUID()
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
