'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/bill-runs/review/licence/{reviewLicenceId}/remove' page
 * @module ViewRemoveService
 */

const FetchRemoveReviewLicenceService = require('./fetch-remove-review-licence.service.js')
const RemovePresenter = require('../../../presenters/bill-runs/review/remove.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/bill-runs/review/licence/{reviewLicenceId}/remove' page
 *
 * @param {string} reviewLicenceId - The UUID of the licence that is being removed from the bill run
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(reviewLicenceId) {
  const reviewLicence = await FetchRemoveReviewLicenceService.go(reviewLicenceId)

  const pageData = RemovePresenter.go(reviewLicence)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}

module.exports = {
  go
}
