'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewSummaryService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const FetchSummaryService = require('./fetch-summary.service.js')
const SummaryHeadingPresenter = require('../../presenters/licences/summary-heading.presenter.js')
const SummaryPresenter = require('../../presenters/licences/summary.presenter.js')
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
  const licence = await FetchLicenceService.go(licenceId)
  const summary = await FetchSummaryService.go(licenceId)

  const summaryHeadingData = SummaryHeadingPresenter.go(licence, summary)
  const pageData = SummaryPresenter.go(summary)

  return {
    ...summaryHeadingData,
    ...pageData,
    activeSecondaryNav: 'summary',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
