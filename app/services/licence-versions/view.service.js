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
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(licenceVersionId, auth) {
  const licenceVersionData = await FetchLicenceVersionService.go(licenceVersionId)

  const pageData = ViewPresenter.go(licenceVersionData, auth)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
