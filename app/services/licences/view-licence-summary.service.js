'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const FetchLicenceSummaryService = require('./fetch-licence-summary.service.js')
const ViewLicenceService = require('./view-licence.service.js')
const ViewLicenceSummaryPresenter = require('../../presenters/licences/view-licence-summary.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go(licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId)

  const summaryLicenceData = await FetchLicenceSummaryService.go(licenceId)

  const pageData = ViewLicenceSummaryPresenter.go(summaryLicenceData)

  return {
    ...pageData,
    ...commonData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
