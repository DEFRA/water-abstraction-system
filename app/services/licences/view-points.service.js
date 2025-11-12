'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 * @module ViewPointsService
 */

const FetchLicencePointsService = require('../licences/fetch-licence-points.service.js')
const PointsPresenter = require('../../presenters/licences/points.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence points template
 */
async function go(licenceId) {
  const licencePoints = await FetchLicencePointsService.go(licenceId)

  const pageData = PointsPresenter.go(licencePoints)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
