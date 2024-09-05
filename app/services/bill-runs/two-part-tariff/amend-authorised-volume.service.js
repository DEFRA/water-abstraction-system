'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the amend authorised volume page
 * @module AmendAuthorisedVolumeService
 */

const AmendAuthorisedVolumePresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-authorised-volume.presenter.js')
const FetchAuthorisedVolumeService = require('./fetch-authorised-volume.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the amend authorised volume page
 *
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being viewed
 *
 * @returns {Promise<object>} the 'pageData' needed to view the amend authorised volume page
 */
async function go (billRunId, licenceId, reviewChargeReferenceId) {
  const { billRun, reviewChargeReference } = await FetchAuthorisedVolumeService.go(billRunId, reviewChargeReferenceId)

  const pageData = AmendAuthorisedVolumePresenter.go(billRun, reviewChargeReference, licenceId)

  return pageData
}

module.exports = {
  go
}
