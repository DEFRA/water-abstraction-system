'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 * @module ViewUserExternalService
 */

const FetchUserExternalService = require('./fetch-user-external.service.js')
const UserExternalPresenter = require('../../presenters/users/user-external.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(id, auth) {
  const externalUser = await FetchUserExternalService.go(id)

  const formattedData = UserExternalPresenter.go(externalUser, auth.credentials.scope)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
