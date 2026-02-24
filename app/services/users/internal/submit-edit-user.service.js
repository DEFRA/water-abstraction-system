'use strict'

/**
 * Orchestrates validating and updating the data for the `/users/internal/{id}/edit` page
 *
 * @module SubmitEditUserService
 */

const Boom = require('@hapi/boom')

const DetermineUserEditableService = require('./determine-user-editable.service.js')
const EditUserPresenter = require('../../../presenters/users/internal/edit-user.presenter.js')
const EditUserValidator = require('../../../validators/users/internal/edit-user.validator.js')
const FetchAllPermissionsDetailsService = require('./fetch-all-permissions-details.service.js')
const FetchLegacyIdService = require('../fetch-legacy-id.service.js')
const FetchPermissionsDetailsService = require('./fetch-permissions-details.service.js')
const UpdateUserService = require('./update-user.service.js')

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating and updating the data for the `/users/internal/{id}/edit` page
 *
 * This route is scoped to the `manage_accounts` role, so only those users can access it.
 *
 * However, there is an additional check to determine whether the user can edit the user being viewed.
 *
 * This is because only a user with the `super` permissions can edit another user with `super` permissions.
 *
 * @param {number} id - The ID of the user to edit
 * @param {object} payload - The submitted form data
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine what actions
 * the user can take, i.e. whether they can edit the user or not
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, payload, auth) {
  const validationResult = _validate(payload)
  const { permissions: newPermissions } = payload
  const { canEdit, isSuper, user } = await DetermineUserEditableService.go(id, auth, payload)

  if (!canEdit) {
    return Boom.forbidden()
  }

  if (validationResult) {
    const allPermissionsDetails = await FetchAllPermissionsDetailsService.go(isSuper)
    const pageData = EditUserPresenter.go(user, allPermissionsDetails, newPermissions)

    return {
      error: validationResult,
      ...pageData
    }
  }

  const userId = await FetchLegacyIdService.go(id)

  await _save(id, userId, newPermissions)

  return {}
}

async function _save(id, userId, permissions) {
  const { groups, roles } = await FetchPermissionsDetailsService.go(permissions)

  return UpdateUserService.go({ id, groups, roles, userId })
}

function _validate(payload) {
  const validationResult = EditUserValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
