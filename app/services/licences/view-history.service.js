'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 * @module ViewHistoryService
 */

const FetchHistoryService = require('./fetch-history.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const HistoryPresenter = require('../../presenters/licences/history.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence history template.
 */
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)

  const licenceHistory = await FetchHistoryService.go(licenceId)

  const pageData = HistoryPresenter.go(licenceHistory, licence)

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'history',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
