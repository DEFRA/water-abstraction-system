'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 * @module ViewPointsService
 */

const FetchLicencePointsService = require('../licences/fetch-licence-points.service.js')
const PointsPresenter = require('../../presenters/licences/points.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence points template
 */
async function go(licenceId, auth) {
  const licencePoints = await FetchLicencePointsService.go(licenceId)

  const pageData = PointsPresenter.go(licencePoints)

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'points',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
