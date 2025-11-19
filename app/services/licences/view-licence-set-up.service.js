'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence set up tab
 * @module ViewLicenceSetUpService
 */

const FetchAgreementsService = require('./fetch-agreements.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchLicenceRefService = require('./fetch-licence-ref.service.js')
const FetchReturnVersionsService = require('./fetch-return-versions.service.js')
const FetchWorkflowsService = require('./fetch-workflows.service.js')
const ViewLicenceSetUpPresenter = require('../../presenters/licences/view-licence-set-up.presenter.js')
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
  const licence = await FetchLicenceRefService.go(licenceId)

  const agreements = await FetchAgreementsService.go(licence.licenceRef)
  const chargeVersions = await FetchChargeVersionsService.go(licenceId)
  const workflows = await FetchWorkflowsService.go(licenceId)
  const returnVersions = await FetchReturnVersionsService.go(licenceId)

  const pageData = ViewLicenceSetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, licence)

  return {
    ...pageData,
    activeTab: 'set-up',
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
