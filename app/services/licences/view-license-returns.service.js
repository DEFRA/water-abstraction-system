'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const ViewLicenceService = require('./view-licence.service')
const ViewLicenceReturnsPresenter = require('../../presenters/licences/view-licence-returns.presenter')
/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)
  const pageData = ViewLicenceReturnsPresenter.go()

  return {
    ...pageData,
    ...commonData
  }
}

module.exports = {
  go
}
