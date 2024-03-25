'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceService
 */

const FetchLicenceAbstractionConditionsService = require('./fetch-licence-abstraction-conditions.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const ViewLicencePresenter = require('../../presenters/licences/view-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId) {
  const licenceData = await FetchLicenceService.go(licenceId)

  const currentLicenceVersionId = licenceData?.licenceVersions[0]?.id

  const licenceAbstractionConditions = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)

  const pageData = ViewLicencePresenter.go(licenceData, licenceAbstractionConditions)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
