'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 * @module ViewConditionsService
 */

const ConditionsPresenter = require('../../presenters/licences/conditions.presenter.js')
const FetchLicenceConditionsService = require('./fetch-licence-conditions.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence conditions template
 */
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)
  const conditions = await FetchLicenceConditionsService.go(licenceId)

  const pageData = ConditionsPresenter.go(conditions, licence)

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'conditions',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
