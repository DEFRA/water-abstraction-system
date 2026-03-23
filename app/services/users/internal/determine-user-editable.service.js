'use strict'

/**
 * Determines whether a user can be edited for the `/users/internal/{id}` page and its edit page at
 * `/users/internal/{id}/edit`
 *
 * @module DetermineUserEditableService
 */

const FetchUserService = require('./fetch-user.service.js')

/**
 * Determines whether a user can be edited for the `/users/internal/{id}` page and its edit page at
 * `/users/internal/{id}/edit`
 *
 * These routes are scoped to the `manage_accounts` role, so only those users can access them.
 *
 * However, there is an additional check to determine whether the current user can edit the user being viewed.
 *
 * This is because only a user with the `super` permissions can edit another user with `super` permissions.
 *
 * @param {number} id - The ID of the user to edit
 * @param {object} auth - The current user's authentication details from `request.auth`, used to determine what actions
 * the user can take, i.e. whether they can edit the user or not
 * @param {object} payload - The submitted form data (only relevant for the edit page)
 *
 * @returns {Promise<object>} The user being viewed and whether the current user can edit them
 */
async function go(id, auth, payload = { permissions: '' }) {
  const currentUser = await FetchUserService.go(auth.credentials.user.id)
  const user = await FetchUserService.go(id)

  const existingPermissions = user.$permissions().key
  const { permissions: newPermissions } = payload

  const isSuper = currentUser.$permissions().key === 'super'

  const canEdit = isSuper || (existingPermissions !== 'super' && newPermissions !== 'super')

  return { canEdit, isSuper, user }
}

module.exports = {
  go
}
