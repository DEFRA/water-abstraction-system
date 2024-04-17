'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the match details page on a charge element in a
 * two-part tariff bill run
 * @module MatchDetailsService
 */

const FetchMatchDetailsService = require('./fetch-match-details.service.js')
const MatchDetailsPresenter = require('../../../presenters/bill-runs/two-part-tariff/match-details.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view match details page for a charge element
 *
 * @param {String} billRunId - The UUID for the bill run
 * @param {String} licenceId - The UUID of the licence that is being reviewed
 * @param {String} reviewChargeElementId - The UUID of the review charge element being viewed
 *
 * @returns {Promise<Object>} the 'pageData' needed to view the match details of an individual charge
 */
async function go (billRunId, licenceId, reviewChargeElementId) {
  const { billRun, reviewChargeElement } = await FetchMatchDetailsService.go(billRunId, reviewChargeElementId)

  const pageData = MatchDetailsPresenter.go(billRun, reviewChargeElement, licenceId)

  return pageData
}

module.exports = {
  go
}
