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
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeElementId - The UUID of the review charge element being viewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed to view the match details of an individual charge
 */
async function go (billRunId, licenceId, reviewChargeElementId, yar) {
  const { billRun, reviewChargeElement } = await FetchMatchDetailsService.go(billRunId, reviewChargeElementId)

  const [bannerMessage] = yar.flash('banner')
  const pageData = MatchDetailsPresenter.go(billRun, reviewChargeElement, licenceId)

  return {
    bannerMessage,
    ...pageData
  }
}

module.exports = {
  go
}
