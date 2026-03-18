'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 * @module ViewUserService
 */

const FetchLicencesService = require('./fetch-licences.service.js')
const FetchOutstandingVerificationsService = require('./fetch-outstanding-verifications.service.js')
const FetchUserService = require('./fetch-user.service.js')
const UserPresenter = require('../../../presenters/users/external/user.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(id, auth, back = 'users') {
  const externalUser = await FetchUserService.go(id)

  let outstandingVerifications = []
  let licences = []

  if (externalUser.licenceEntity) {
    outstandingVerifications = await FetchOutstandingVerificationsService.go(externalUser.licenceEntity.id)
    licences = await FetchLicencesService.go(externalUser.licenceEntity.id)
  }

  const formattedData = UserPresenter.go(externalUser, outstandingVerifications, licences, auth.credentials.scope, back)

  return {
    activeNavBar: back === 'users' ? 'users' : 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
