'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 * @module ViewUserService
 */

const FetchUserService = require('./fetch-user.service.js')
const UserPresenter = require('../../../presenters/users/internal/user.presenter.js')

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 *
 * @param {number} id - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user page
 */
async function go(id) {
  const internalUser = await FetchUserService.go(id)
  const pageData = UserPresenter.go(internalUser)

  return {
    activeNavBar: FeatureFlagsConfig.enableUsersView ? 'users' : 'search',
    ...pageData
  }
}

module.exports = {
  go
}
