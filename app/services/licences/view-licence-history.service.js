'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 * @module ViewLicenceHistoryService
 */

const FetchLicenceHistoryService = require('./fetch-licence-history.service.js')
const ViewLicenceHistoryPresenter = require('../../presenters/licences/view-licence-history.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence history template.
 */
async function go (licenceId) {
  const licence = await FetchLicenceHistoryService.go(licenceId)

  const pageData = ViewLicenceHistoryPresenter.go(licence)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
