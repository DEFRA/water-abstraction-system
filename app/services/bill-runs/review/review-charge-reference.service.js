'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review charge reference page
 * @module ReviewChargeReferenceService
 */

const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')
const ReviewChargeReferencePresenter = require('../../../presenters/bill-runs/review/review-charge-reference.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the review charge reference page
 *
 * @param {string} reviewChargeReferenceId - The UUID of the charge reference being reviewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed for the review charge reference page. It contains details of the
 * bill run, charge reference and the charge adjustments
 */
async function go (reviewChargeReferenceId, yar) {
  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)

  const [bannerMessage] = yar.flash('banner')
  const [chargeMessage] = yar.flash('charge')

  const pageData = ReviewChargeReferencePresenter.go(reviewChargeReference)

  return {
    pageTitle: 'Charge reference details',
    bannerMessage,
    chargeMessage,
    ...pageData
  }
}

module.exports = {
  go
}
