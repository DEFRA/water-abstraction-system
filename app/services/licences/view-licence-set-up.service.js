'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence set up tab
 * @module ViewLicenceSetUpService
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchAgreementsService = require('./fetch-agreements.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchReturnVersionsService = require('./fetch-return-versions.service.js')
const FetchWorkflowsService = require('./fetch-workflows.service.js')
const SetUpPresenter = require('../../presenters/licences/set-up.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence set up page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {Object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence set up template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const agreements = await FetchAgreementsService.go(commonData.licenceRef)
  const chargeVersions = await FetchChargeVersionsService.go(licenceId)
  const workflows = await FetchWorkflowsService.go(licenceId)
  const returnVersions = await FetchReturnVersionsService.go(licenceId)

  const licenceSetUpData = SetUpPresenter
    .go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

  return {
    activeTab: 'set-up',
    ...commonData,
    ...licenceSetUpData,
    enableRequirementsForReturns: FeatureFlagsConfig.enableRequirementsForReturns
  }
}

module.exports = {
  go
}
