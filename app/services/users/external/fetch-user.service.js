'use strict'

/**
 * Fetches an external user for display on the `/users/external/{id}` page
 * @module FetchUserDetailsService
 */

const UserModel = require('../../../models/user.model.js')

/**
 * Fetches an external user for display on the `/users/external/{id}` page
 *
 * @param {string} id - The ID of the requested user
 *
 * @returns {Promise<module:UserModel>} the requested user
 */
async function go(id) {
  const user = await UserModel.query()
    .select(['id', 'licenceEntityId', 'username'])
    .modify('permissions')
    .modify('status')
    .findById(id)

  return user
}

module.exports = {
  go
}
