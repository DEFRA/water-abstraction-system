'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 * @module ViewLicenceConditionsService
 */

const FetchLicenceConditionsService = require('./fetch-licence-conditions.service.js')
const ViewLicenceConditionsPresenter = require('../../presenters/licences/view-licence-conditions.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence conditions template
 */
async function go(licenceId) {
  const licenceVersionPurposeConditionTypes = await FetchLicenceConditionsService.go(licenceId)

  const pageData = ViewLicenceConditionsPresenter.go(licenceVersionPurposeConditionTypes)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
