'use strict'

/**
 * Orchestrates page data for the '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised' page
 * @module ViewAuthorisedService
 */

const AuthorisedPresenter = require('../../../presenters/bill-runs/review/authorised.presenter.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')

/**
 * Orchestrates page data for the '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised' page
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference whose authorised volume is being
 * amended
 *
 * @returns {Promise<object>} the 'pageData' needed to view the amend authorised volume page
 */
async function go(reviewChargeReferenceId) {
  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)

  const formattedData = AuthorisedPresenter.go(reviewChargeReference)

  return {
    activeNavBar: 'bill-runs',
    ...formattedData
  }
}

module.exports = {
  go
}
