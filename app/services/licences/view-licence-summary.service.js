'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const FetchLicenceSummaryService = require('./fetch-licence-summary.service.js')
const ViewLicenceSummaryContentPresenter = require('../../presenters/licences/view-licence-summary-content.presenter.js')
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
  const licenceData = await FetchLicenceSummaryService.go(licenceId)

  const licenceSummaryContentData = ViewLicenceSummaryContentPresenter.go(licenceData)
  const pageData = ViewLicenceSummaryPresenter.go(licenceData)

  return {
    ...licenceSummaryContentData,
    ...pageData,
    activeNavBar: 'search',
    activeTab: 'summary',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
