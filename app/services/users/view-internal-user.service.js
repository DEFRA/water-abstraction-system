'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/internal-users/{userId}` page
 * @module ViewInternalUserService
 */

const FetchInternalUserService = require('./fetch-internal-user.service.js')
const InternalUserPresenter = require('../../presenters/users/internal-user.presenter.js')

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Orchestrates fetching and presenting internal user data for `/internal-users/{userId}` page
 *
 * This page may display either an external or internal user - this service handles the internal users.
 *
 * @param {number} userId - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user page
 */
async function go(userId) {
  const internalUser = await FetchInternalUserService.go(userId)
  const pageData = InternalUserPresenter.go(internalUser)

  return {
    activeNavBar: featureFlagsConfig.enableUsersView ? 'users' : 'search',
    ...pageData
  }
}

module.exports = {
  go
}
