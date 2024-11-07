'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 * @module ViewLicencePointsService
 */

const util = require('util')

const FetchLicencePointsService = require('../licences/fetch-licence-points.service.js')
const ViewLicencePointsPresenter = require('../../presenters/licences/view-licence-points.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence points template
 */
async function go (licenceId) {
  const licencePoints = await FetchLicencePointsService.go(licenceId)

  const pageData = ViewLicencePointsPresenter.go(licencePoints)

  console.log('🚀🚀🚀 ~ pageData:', util.inspect(pageData, { showHidden: false, depth: null, colors: true }))

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
