'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view match details page on a charge element in a
 * two-part tariff bill run
 * @module ViewMatchDetailsService
 */

const FetchViewMatchDetailsService = require('./fetch-view-match-details.service.js')
const ViewMatchDetailsPresenter = require('../../../presenters/bill-runs/two-part-tariff/view-match-details.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view match details page for a charge element
 *
 * @param {module:BillRunModel} billRunId The UUID for the bill run
 * @param {module:LicenceModel} licenceId The UUID of the licence that is being reviewed
 * @param {module:ReviewChargeElementModel} reviewChargeElementId The UUID of the review charge element being viewed
 *
 * @returns {Object} an object representing the 'pageData' needed to view the match details of an individual charge
 * element
 */
async function go (billRunId, licenceId, reviewChargeElementId) {
  const { billRun, reviewChargeElement } = await FetchViewMatchDetailsService.go(billRunId, reviewChargeElementId)

  const pageData = ViewMatchDetailsPresenter.go(billRun, reviewChargeElement, licenceId)

  return pageData
}

module.exports = {
  go
}
