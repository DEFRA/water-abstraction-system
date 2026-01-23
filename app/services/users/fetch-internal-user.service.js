'use strict'

/**
 * Fetches an internal user for display on the /users/{userId} page
 * @module FetchInternalUserService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches an internal user for display on the /users/{userId} page
 *
 * @param {number} userId - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(userId) {
  return UserModel.query().select(['id', 'username']).modify('status').modify('permissions').findById(userId)
}

module.exports = {
  go
}
