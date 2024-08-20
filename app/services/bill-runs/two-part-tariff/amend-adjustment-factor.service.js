'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the amend adjustment factor page
 * @module AmendAdjustmentFactorService
 */

const AmendAdjustmentFactorPresenter = require('../../../presenters/bill-runs/two-part-tariff/amend-adjustment-factor.presenter.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the amend adjustment factor page
 *
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference being viewed
 *
 * @returns {Promise<object>} the 'pageData' needed to view the amend adjustment factor page
 */
async function go (billRunId, licenceId, reviewChargeReferenceId) {
  const {
    billRun,
    reviewChargeReference
  } = await FetchReviewChargeReferenceService.go(billRunId, reviewChargeReferenceId)

  const pageData = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

  return pageData
}

module.exports = {
  go
}
