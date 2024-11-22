'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the two-part tariff review licence page
 * @module ReviewLicenceService
 */

const FetchReviewLicenceService = require('./fetch-review-licence.service.js')
const ReviewLicencePresenter = require('../../../presenters/bill-runs/review/review-licence.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the two-part tariff review licence page
 *
 * @param {string} reviewLicenceId - The UUID of the licence that is being reviewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed for the review licence page. It contains the licence, bill run,
 * matched and unmatched returns and the licence charge data
 */
async function go(reviewLicenceId, yar) {
  const reviewLicence = await FetchReviewLicenceService.go(reviewLicenceId)

  const [bannerMessage] = yar.flash('banner')
  const pageData = ReviewLicencePresenter.go(reviewLicence)

  return {
    bannerMessage,
    ...pageData
  }
}

module.exports = {
  go
}
