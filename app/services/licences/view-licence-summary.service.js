'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const FetchLicenceAbstractionConditionsService = require('./fetch-licence-abstraction-conditions.service.js')
const FetchLicenceSummaryService = require('./fetch-licence-summary.service.js')
const ViewLicenceSummaryPresenter = require('../../presenters/licences/view-licence-summary.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const summaryLicenceData = await FetchLicenceSummaryService.go(licenceId)

  const currentLicenceVersionId = summaryLicenceData?.licenceVersions[0]?.id

  const licenceAbstractionConditions = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)

  const pageData = ViewLicenceSummaryPresenter.go(summaryLicenceData, licenceAbstractionConditions)

  return {
    ...pageData,
    ...commonData
  }
}

module.exports = {
  go
}
