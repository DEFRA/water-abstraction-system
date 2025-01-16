'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review charge reference factors page
 * @module FactorsService
 */

const FactorsPresenter = require('../../../presenters/bill-runs/review/factors.presenter.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the review charge reference factors page
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference whose factors are being amended
 *
 * @returns {Promise<object>} the 'pageData' needed for the review charge reference factors page
 */
async function go(reviewChargeReferenceId) {
  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)

  const formattedData = FactorsPresenter.go(reviewChargeReference)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

module.exports = {
  go
}
