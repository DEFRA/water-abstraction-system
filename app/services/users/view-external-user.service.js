'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/{userId}` page
 * @module ViewExternalUserService
 */

const FetchExternalUserService = require('./fetch-external-user.service.js')
const ExternalUserPresenter = require('../../presenters/users/external-user.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/{userId}` page
 *
 * This page may display either an external or internal user - this service handles the external users.
 *
 * @param {number} userId - The user's ID
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(userId) {
  const externalUser = await FetchExternalUserService.go(userId)

  return ExternalUserPresenter.go(externalUser)
}

module.exports = {
  go
}
