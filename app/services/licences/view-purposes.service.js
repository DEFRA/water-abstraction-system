'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 * @module ViewPurposesService
 */

const FetchLicencePurposesService = require('../licences/fetch-licence-purposes.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const PurposesPresenter = require('../../presenters/licences/purposes.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence purposes template
 */
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)
  const purposes = await FetchLicencePurposesService.go(licenceId)

  const pageData = PurposesPresenter.go(purposes, licence)

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'purposes',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
