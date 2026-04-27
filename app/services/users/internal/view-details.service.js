'use strict'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/details` page
 * @module ViewDetailsService
 */

const FetchUserDetailsService = require('./fetch-user-details.service.js')
const DetailsPresenter = require('../../../presenters/users/internal/details.presenter.js')

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/details` page
 *
 * @param {number} id - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user details page
 */
async function go(id) {
  const internalUser = await FetchUserDetailsService.go(id)
  const pageData = DetailsPresenter.go(internalUser)

  return {
    activeNavBar: 'users',
    activeSecondaryNav: 'details',
    ...pageData
  }
}

module.exports = {
  go
}
