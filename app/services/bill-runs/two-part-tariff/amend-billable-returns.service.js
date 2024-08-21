'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the amend billable returns page
 * @module AmendBillableReturnsService
 */

const AmendBillableReturnsPresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-billable-returns.presenter.js')
const FetchMatchDetailsService = require('./fetch-match-details.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the amend billable returns page
 *
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeElementId - The UUID of the review charge element being viewed
 *
 * @returns {Promise<object>} the 'pageData' needed to view the edit billable return volumes page
 */
async function go (billRunId, licenceId, reviewChargeElementId) {
  const { billRun, reviewChargeElement } = await FetchMatchDetailsService.go(billRunId, reviewChargeElementId)

  const pageData = AmendBillableReturnsPresenter.go(billRun, reviewChargeElement, licenceId)

  return pageData
}

module.exports = {
  go
}
