'use strict'

/**
 * Orchestrates page data for the '/bill-runs/review/licence/{reviewLicenceId}' page
 * @module ViewReviewLicenceService
 */

const FetchReviewLicenceService = require('./fetch-review-licence.service.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/review/review-licence.presenter.js')

/**
 * Orchestrates page data for the '/bill-runs/review/licence/{reviewLicenceId}' page
 *
 * @param {string} reviewLicenceId - The UUID of the licence that is being reviewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(reviewLicenceId, yar) {
  const reviewLicence = await FetchReviewLicenceService.go(reviewLicenceId)

  const [bannerMessage] = yar.flash('banner')
  const pageData = ReviewLicencePresenter.go(reviewLicence)

  return {
    activeNavBar: 'bill-runs',
    bannerMessage,
    ...pageData
  }
}

module.exports = {
  go
}
