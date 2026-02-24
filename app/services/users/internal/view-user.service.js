'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 * @module ViewUserService
 */

const DetermineUserEditableService = require('./determine-user-editable.service.js')
const UserPresenter = require('../../../presenters/users/internal/user.presenter.js')

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine what actions
 * the user can take, i.e. whether they can edit the user or not
 *
 * @returns {Promise<object>} The view data for the internal user page
 */
async function go(id, auth) {
  const { user, canEdit } = await DetermineUserEditableService.go(id, auth)

  const pageData = UserPresenter.go(user, canEdit)

  return {
    activeNavBar: FeatureFlagsConfig.enableUsersView ? 'users' : 'search',
    ...pageData
  }
}

module.exports = {
  go
}
