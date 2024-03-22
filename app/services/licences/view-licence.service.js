'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const FetchLicenceVersionPurposeConditionService = require('./fetch-licence-version-purpose-condition.service.js')
const ViewLicencePresenter = require('../../presenters/licences/view-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} id The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (id) {
  const licenceData = await FetchLicenceService.go(id)

  const licenceVersionPurposeConditionData = await FetchLicenceVersionPurposeConditionService.go(licenceData)

  const pageData = ViewLicencePresenter.go(licenceData, licenceVersionPurposeConditionData)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
