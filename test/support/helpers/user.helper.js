'use strict'

/**
 * @module UserHelper
 */

const { randomInteger } = require('./general.helper.js')
const UserModel = require('../../../app/models/user.model.js')

/**
 * Add a new user
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `username` - user.name@test.com
 * - `password` - P@55word (note that this is salted and hashed before being persisted)
 * - `resetRequired` - 0
 * - `badLogins` - 0
 * - `application` - water_admin
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:UserModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  // Overwrite the current password with the hashed version we want to persist
  insertData.password = UserModel.generateHashedPassword(insertData.password)

  return UserModel.query()
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
    username: 'user.name@test.com',
    password: 'P@55word',
    resetRequired: 0,
    badLogins: 0,
    application: 'water_admin'
  }

  return {
    ...defaults,
    ...data
  }
}

function generateUserId () {
  return randomInteger(100001, 199999)
}

module.exports = {
  add,
  defaults,
  generateUserId
}
