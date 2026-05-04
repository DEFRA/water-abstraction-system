'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/details` page
 * @module ViewDetailsService
 */

const FetchLicencesDal = require('../../../dal/users/external/fetch-licences.dal.js')
const FetchUserDetailsService = require('./fetch-user-details.service.js')
const DetailsPresenter = require('../../../presenters/users/external/details.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/details` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(id, auth, back = 'users') {
  const user = await FetchUserDetailsService.go(id)

  let licences = []

  if (user.licenceEntity) {
    licences = await FetchLicencesDal.go(user.licenceEntity.id)
  }

  const pageData = DetailsPresenter.go(user, licences, auth.credentials.scope, back)

  return {
    activeNavBar: back === 'users' ? 'users' : 'search',
    activeSecondaryNav: 'details',
    ...pageData
  }
}

module.exports = {
  go
}
