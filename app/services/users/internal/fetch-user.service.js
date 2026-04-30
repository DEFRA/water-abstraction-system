'use strict'

/**
 * Fetches the user needed for the view `/users/internal/{id}/communications` page
 * @module FetchUserService
 */

const UserModel = require('../../../models/user.model.js')

/**
 * Fetches the user needed for the view `/users/internal/{id}/communications` page
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
