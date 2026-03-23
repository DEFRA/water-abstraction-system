'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/users/internal/{id}/edit` page
 *
 * @module ViewEditUserService
 */

const Boom = require('@hapi/boom')

const DetermineUserEditableService = require('./determine-user-editable.service.js')
const EditUserPresenter = require('../../../presenters/users/internal/edit-user.presenter.js')
const FetchAllPermissionsDetailsService = require('./fetch-all-permissions-details.service.js')

const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Orchestrates fetching and presenting the data for the `/users/internal/{id}/edit` page
 *
 * This route is scoped to the `manage_accounts` role, so only those users can access it.
 *
 * However, there is an additional check to determine whether the user can edit the user being viewed.
 *
 * This is because only a user with the `super` permissions can edit another user with `super` permissions.
 *
 * @param {number} id - The ID of the user to edit
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine what actions
 * the user can take, i.e. whether they can edit the user or not
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, auth) {
  const { canEdit, isSuper, user } = await DetermineUserEditableService.go(id, auth)

  if (!canEdit) {
    return Boom.forbidden()
  }

  const allPermissionsDetails = await FetchAllPermissionsDetailsService.go(isSuper)

  const pageData = EditUserPresenter.go(user, allPermissionsDetails, user.$permissions().key)

  return {
    activeNavBar: FeatureFlagsConfig.enableUsersView ? 'users' : 'search',
    ...pageData
  }
}

module.exports = {
  go
}
