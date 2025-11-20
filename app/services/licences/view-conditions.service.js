'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 * @module ViewConditionsService
 */

const FetchLicenceConditionsService = require('./fetch-licence-conditions.service.js')
const ConditionsPresenter = require('../../presenters/licences/conditions.presenter.js')
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
  const licenceVersionPurposeConditionTypes = await FetchLicenceConditionsService.go(licenceId)

  const pageData = ConditionsPresenter.go(licenceVersionPurposeConditionTypes)

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSummarySubNav: 'conditions',
    activeTab: 'summary',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
