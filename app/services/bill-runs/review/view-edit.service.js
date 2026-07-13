/**
 * Orchestrates page data for the '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit' page
 * @module ViewEditService
 */

import EditPresenter from '../../../presenters/bill-runs/review/edit.presenter.js'
import FetchReviewChargeElementService from './fetch-review-charge-element.service.js'

/**
 * Orchestrates page data for the '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit' page
 *
 * @param {string} reviewChargeElementId - The UUID of the charge element being reviewed
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are editing to the one they selected on the review licence screen
 *
 * @returns {Promise<object>} the 'pageData' needed to view the edit billable return volumes page
 */
export default async function (reviewChargeElementId, elementIndex) {
  const reviewChargeElement = await FetchReviewChargeElementService(reviewChargeElementId)

  const pageData = EditPresenter(reviewChargeElement, elementIndex)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}
