/**
 * Orchestrates page data for the '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors' page
 * @module ViewFactorsService
 */

import FactorsPresenter from '../../../presenters/bill-runs/review/factors.presenter.js'
import FetchReviewChargeReferenceService from './fetch-review-charge-reference.service.js'

/**
 * Orchestrates page data for the '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors' page
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference whose factors are being amended
 *
 * @returns {Promise<object>} the 'pageData' needed for the review charge reference factors page
 */
async function go(reviewChargeReferenceId) {
  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)

  const pageData = FactorsPresenter.go(reviewChargeReference)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}

export default {
  go
}
