'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceSummaryService
 */

const FetchLicenceAbstractionConditionsService = require('./fetch-licence-abstraction-conditions.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const ViewLicenceSummaryPresenter = require('../../presenters/licences/view-license-summary.presenter')
const ViewLicenceService = require('./view-licence.service')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth) {

  const commonData = await ViewLicenceService.go(licenceId, auth)

  // fix this fetch
  const licenceData = await FetchLicenceService.go(licenceId)

  const currentLicenceVersionId = licenceData?.licenceVersions[0]?.id

  const licenceAbstractionConditions = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)

  const pageData = ViewLicenceSummaryPresenter.go(licenceData, licenceAbstractionConditions)

  return {
    ...pageData,
    ...commonData
  }
}

module.exports = {
  go
}
