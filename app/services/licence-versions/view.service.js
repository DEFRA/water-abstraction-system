'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @module ViewService
 */

const FetchLicenceVersionService = require('./fetch-licence-version.service.js')
const ViewPresenter = require('../../presenters/licence-versions/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @param {string} licenceVersionId - The UUID of the licence version
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(licenceVersionId) {
  const licenceVersion = await FetchLicenceVersionService.go(licenceVersionId)

  const pageData = ViewPresenter.go(licenceVersion)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
