'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review charge element page
 * @module ReviewChargeElementService
 */

const FetchReviewChargeElementService = require('./fetch-review-charge-element.service.js')
const ReviewChargeElementPresenter = require('../../../presenters/bill-runs/review/review-charge-element.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the review charge element page
 *
 * @param {string} reviewChargeElementId - The UUID of the charge element being reviewed
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are reviewing to the one they selected on the review licence screen
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed for the review charge element page
 */
async function go(reviewChargeElementId, elementIndex, yar) {
  const reviewChargeElement = await FetchReviewChargeElementService.go(reviewChargeElementId)

  const [bannerMessage] = yar.flash('banner')

  const formattedData = ReviewChargeElementPresenter.go(reviewChargeElement, elementIndex)

  return {
    activeNavBar: 'bill-runs',
    bannerMessage,
    ...formattedData
  }
}

module.exports = {
  go
}
