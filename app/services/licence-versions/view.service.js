'use strict'

/**
 * Orchestrates fetching and presenting the data for `/licence-versions/{id}` page
 * @module ViewService
 */

const FetchLicenceVersionService = require('./fetch-licence-version.service.js')
const ViewPresenter = require('../../presenters/licence-versions/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/licence-versions/{id}` page
 *
 * @param {string} licenceVersionId - The UUID for the licence version
 *
 * @returns {Promise<object>} page data needed by the view template
 */
async function go(licenceVersionId) {
  const licenceVersions = await FetchLicenceVersionService.go(licenceVersionId)

  const formattedData = ViewPresenter.go(licenceVersions)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
