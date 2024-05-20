'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence set up tab
 * @module ViewLicenceSetUpService
 */

const LicenceSetUpPresenter = require('../../presenters/licences/licence-set-up.presenter.js')
const FetchLicenceSetUpService = require('./fetch-licence-set-up.service.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence set up page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence set up template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const licenceSetUp = await FetchLicenceSetUpService.go(licenceId)
  const licenceSetUpData = LicenceSetUpPresenter.go(licenceSetUp)

  return {
    activeTab: 'set-up',
    ...commonData,
    ...licenceSetUpData
  }
}

module.exports = {
  go
}
