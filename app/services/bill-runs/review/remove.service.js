'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the remove review licence confirmation page
 * @module RemoveService
 */

const FetchRemoveReviewLicenceService = require('./fetch-remove-review-licence.service.js')
const RemovePresenter = require('../../../presenters/bill-runs/review/remove.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the remove bill run licence confirmation page
 *
 * @param {string} reviewLicenceId - The UUID of the licence that is being removed from the bill run
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the remove licence template. It contains
 * details of the bill run & the licence reference.
 */
async function go(reviewLicenceId) {
  const reviewLicence = await FetchRemoveReviewLicenceService.go(reviewLicenceId)

  return RemovePresenter.go(reviewLicence)
}

module.exports = {
  go
}
