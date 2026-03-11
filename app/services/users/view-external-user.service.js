'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/external-users/{userId}` page
 * @module ViewExternalUserService
 */

const FetchExternalUserService = require('./fetch-external-user.service.js')
const ExternalUserPresenter = require('../../presenters/users/external-user.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/external-users/{userId}` page
 *
 * This page may display either an external or internal user - this service handles the external users.
 *
 * @param {number} userId - The user's ID
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine what actions
 * the user can take, i.e. whether they can edit the user or not
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(userId, auth) {
  const canEdit = auth.credentials.scope.includes('manage_accounts')
  const externalUser = await FetchExternalUserService.go(userId)
  const formattedData = ExternalUserPresenter.go(externalUser, canEdit)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
