'use strict'

/**
 * Fetches an external user for display on the /users/{userId} page
 * @module FetchExternalUserService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches an external user for display on the /users/{userId} page
 *
 * @param {number} userId - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(userId) {
  return UserModel.query()
    .select(['id', 'username'])
    .modify('status')
    .withGraphFetched('licenceEntity.[licenceEntityRoles.[companyEntity]]')
    .findById(userId)
}

module.exports = {
  go
}
