'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 * @module ViewUserInternalService
 */

const FetchUserInternalService = require('./fetch-user-internal.service.js')
const InternalUserPresenter = require('../../presenters/users/internal-user.presenter.js')

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 *
 * @param {number} userId - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user page
 */
async function go(userId) {
  const internalUser = await FetchUserInternalService.go(userId)
  const formattedData = InternalUserPresenter.go(internalUser)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
