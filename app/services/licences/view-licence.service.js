'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const ViewLicencePresenter = require('../../presenters/view-licences/view-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} id The UUID of the licence
 *
 * @returns {Object} an object representing the `pageData` needed by the licence summary template.
 */
async function go (id) {
  const licenceData = await FetchLicenceService.go(id)
  const pageData = await ViewLicencePresenter.go(licenceData)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
