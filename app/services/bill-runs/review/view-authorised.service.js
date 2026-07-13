/**
 * Orchestrates page data for the '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised' page
 * @module ViewAuthorisedService
 */

import AuthorisedPresenter from '../../../presenters/bill-runs/review/authorised.presenter.js'
import FetchReviewChargeReferenceService from './fetch-review-charge-reference.service.js'

/**
 * Orchestrates page data for the '/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised' page
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference whose authorised volume is being
 * amended
 *
 * @returns {Promise<object>} the 'pageData' needed to view the amend authorised volume page
 */
export default async function viewAuthorisedService(reviewChargeReferenceId) {
  const reviewChargeReference = await FetchReviewChargeReferenceService(reviewChargeReferenceId)

  const pageData = AuthorisedPresenter(reviewChargeReference)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}
