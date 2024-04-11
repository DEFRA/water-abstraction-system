'use strict'

/**
 *
 * @module AmendBillableReturnsService
 */

const AmendBillableReturnsPresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-billable-returns.presenter.js')
const FetchMatchDetailsService = require('./fetch-match-details.service.js')

/**
 *
 * @param {String} billRunId - The UUID for the bill run
 * @param {String} licenceId - The UUID of the licence that is being reviewed
 * @param {String} reviewChargeElementId - The UUID of the review charge element being viewed
 *
 * @returns {Promise<Object>} the 'pageData' needed to view the edit billable return volumes page
 */
async function go (billRunId, licenceId, reviewChargeElementId, error = null) {
  const { billRun, reviewChargeElement } = await FetchMatchDetailsService.go(billRunId, reviewChargeElementId)

  const pageData = AmendBillableReturnsPresenter.go(billRun, reviewChargeElement, licenceId)

  return pageData
}

module.exports = {
  go
}
