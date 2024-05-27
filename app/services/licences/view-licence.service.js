'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const ViewLicencePresenter = require('../../presenters/licences/view-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {string} auth - Auth object
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, auth) {
  const licenceData = await FetchLicenceService.go(licenceId)

  const pageData = ViewLicencePresenter.go(licenceData, auth)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
