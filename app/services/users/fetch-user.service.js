'use strict'

/**
 * Fetches basic user details for user view pages
 * @module FetchUserService
 */

const UserModel = require('../../models/user.model.js')

/**
 * Fetches basic user details for user view pages
 *
 * @param {number} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(id) {
  return UserModel.query().findById(id).select(['id', 'username'])
}

module.exports = {
  go
}
