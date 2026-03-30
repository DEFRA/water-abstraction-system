'use strict'

/**
 * Orchestrates page data for the '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit' page
 * @module ViewEditService
 */

const EditPresenter = require('../../../presenters/bill-runs/review/edit.presenter.js')
const FetchReviewChargeElementService = require('./fetch-review-charge-element.service.js')

/**
 * Orchestrates page data for the '/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit' page
 *
 * @param {string} reviewChargeElementId - The UUID of the charge element being reviewed
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are editing to the one they selected on the review licence screen
 *
 * @returns {Promise<object>} the 'pageData' needed to view the edit billable return volumes page
 */
async function go(reviewChargeElementId, elementIndex) {
  const reviewChargeElement = await FetchReviewChargeElementService.go(reviewChargeElementId)

  const pageData = EditPresenter.go(reviewChargeElement, elementIndex)

  return {
    activeNavBar: 'bill-runs',
    ...pageData
  }
}

module.exports = {
  go
}
