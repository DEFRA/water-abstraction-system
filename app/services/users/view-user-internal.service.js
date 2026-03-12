'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 * @module ViewUserInternalService
 */

const FetchUserInternalService = require('./fetch-user-internal.service.js')
const UserInternalPresenter = require('../../presenters/users/user-internal.presenter.js')

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}` page
 *
 * @param {number} id - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user page
 */
async function go(id) {
  const internalUser = await FetchUserInternalService.go(id)
  const pageData = UserInternalPresenter.go(internalUser)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
