'use strict'

/**
 * Fetches a user to determine their type for display on the /users/{userId} page
 * @module FetchLegacyUserIdService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches a user to determine their type for display on the /users/{userId} page
 *
 * Whilst we still have the legacy `user_id` field in use, this service also returns the new `id` UUID field value so
 * that this can be used internally for fetching the user data for the view.
 *
 * At some point, the other code will be switched over to using the new `id` field and this service can just return the
 * necessary user record.
 *
 * @param {string} id - The new UUID ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user with its legacy numeric ID, equating to the `user_id` field
 * in the database
 */
async function go(id) {
  return UserModel.query().select(['userId']).findById(id)
}

module.exports = {
  go
}
