'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const ViewLicencePresenter = require('../../presenters/licences/view-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)

  const pageData = ViewLicencePresenter.go(licence, auth)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
