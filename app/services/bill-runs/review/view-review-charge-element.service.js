/**
 * Orchestrates page data for the '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}' page
 * @module ViewReviewChargeElementService
 */

import FetchReviewChargeElementService from './fetch-review-charge-element.service.js'
import ReviewChargeElementPresenter from '../../../presenters/bill-runs/review/review-charge-element.presenter.js'

/**
 * Orchestrates page data for the '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}' page
 *
 * @param {string} reviewChargeElementId - The UUID of the charge element being reviewed
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are reviewing to the one they selected on the review licence screen
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed for the review charge element page
 */
export default async function (reviewChargeElementId, elementIndex, yar) {
  const reviewChargeElement = await FetchReviewChargeElementService(reviewChargeElementId)

  const [bannerMessage] = yar.flash('banner')

  const pageData = ReviewChargeElementPresenter(reviewChargeElement, elementIndex)

  return {
    activeNavBar: 'bill-runs',
    bannerMessage,
    ...pageData
  }
}
