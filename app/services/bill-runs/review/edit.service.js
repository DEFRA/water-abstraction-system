'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the amend billable returns page
 * @module EditService
 */

const EditPresenter = require('../../../presenters/bill-runs/review/edit.presenter.js')
const FetchReviewChargeElementService = require('./fetch-review-charge-element.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the amend billable returns page
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
    pageTitle: 'Set the billable returns quantity for this bill run',
    ...pageData
  }
}

module.exports = {
  go
}
