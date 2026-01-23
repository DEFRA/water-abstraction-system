'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/users/{userId}` page
 * @module ViewInternalUserService
 */

const FetchInternalUserService = require('./fetch-internal-user.service.js')
const InternalUserPresenter = require('../../presenters/users/internal-user.presenter.js')

/**
 * Orchestrates fetching and presenting internal user data for `/users/{userId}` page
 *
 * This page may display either an external or internal user - this service handles the internal users.
 *
 * @param {number} userId - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user page
 */
async function go(userId) {
  const internalUser = await FetchInternalUserService.go(userId)

  return InternalUserPresenter.go(internalUser)
}

module.exports = {
  go
}
