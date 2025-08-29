'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence set up tab
 * @module ViewLicenceSetUpService
 */

const FetchAgreementsService = require('./fetch-agreements.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const FetchLicenceVersionsService = require('./fetch-licence-versions.service.js')
const FetchReturnVersionsService = require('./fetch-return-versions.service.js')
const FetchWorkflowsService = require('./fetch-workflows.service.js')
const ViewLicenceSetUpPresenter = require('../../presenters/licences/view-licence-set-up.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence set up page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence set up template.
 */
async function go(licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const viewChargeVersions = auth.credentials.scope.includes('view_charge_versions')

  const agreements = await _agreements(viewChargeVersions, commonData.licenceRef)
  const chargeVersions = await _chargeVersions(viewChargeVersions, licenceId)
  const workflows = await _workflows(viewChargeVersions, licenceId)
  const returnVersions = await FetchReturnVersionsService.go(licenceId)
  const licenceVersions = await FetchLicenceVersionsService.go(licenceId)

  const licenceSetUpData = ViewLicenceSetUpPresenter.go(
    licenceVersions,
    chargeVersions,
    workflows,
    agreements,
    returnVersions,
    auth,
    commonData
  )

  return {
    activeTab: 'set-up',
    ...commonData,
    ...licenceSetUpData
  }
}

async function _agreements(viewChargeVersions, licenceRef) {
  if (!viewChargeVersions) {
    return []
  }

  return FetchAgreementsService.go(licenceRef)
}

async function _chargeVersions(viewChargeVersions, licenceId) {
  if (!viewChargeVersions) {
    return []
  }

  return FetchChargeVersionsService.go(licenceId)
}

async function _workflows(viewChargeVersions, licenceId) {
  if (!viewChargeVersions) {
    return []
  }

  return FetchWorkflowsService.go(licenceId)
}

module.exports = {
  go
}
