'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 * @module ViewUserExternalService
 */

const FetchUserExternalService = require('./fetch-user-external.service.js')
const ExternalUserPresenter = require('../../presenters/users/external-user.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 *
 * @param {number} id - The user's ID
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(id) {
  const externalUser = await FetchUserExternalService.go(id)
  const formattedData = ExternalUserPresenter.go(externalUser)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
