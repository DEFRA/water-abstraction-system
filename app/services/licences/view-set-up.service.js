'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence set up tab
 * @module ViewSetUpService
 */

const FetchAgreementsService = require('./fetch-agreements.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const FetchReturnVersionsService = require('./fetch-return-versions.service.js')
const FetchWorkflowsService = require('./fetch-workflows.service.js')
const ViewSetUpPresenter = require('../../presenters/licences/view-set-up.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence set up page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence set up template.
 */
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)

  const agreements = await FetchAgreementsService.go(licence.licenceRef)
  const chargeVersions = await FetchChargeVersionsService.go(licenceId)
  const workflows = await FetchWorkflowsService.go(licenceId)
  const returnVersions = await FetchReturnVersionsService.go(licenceId)

  const pageData = ViewSetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, licence)

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'set-up',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
