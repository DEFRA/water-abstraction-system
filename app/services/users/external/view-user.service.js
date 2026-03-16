'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 * @module ViewUserService
 */

const FetchUserService = require('./fetch-user.service.js')
const UserPresenter = require('../../../presenters/users/external/user.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(id, auth) {
  const externalUser = await FetchUserService.go(id)

  const formattedData = UserPresenter.go(externalUser, auth.credentials.scope)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
