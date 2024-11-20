'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the review charge reference authorised page
 * @module AuthorisedService
 */

const AuthorisedPresenter = require('../../../presenters/bill-runs/review/authorised.presenter.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the review charge reference authorised page
 *
 * @param {string} reviewChargeReferenceId - The UUID of the review charge reference whose authorised volume is being
 * amended
 *
 * @returns {Promise<object>} the 'pageData' needed to view the amend authorised volume page
 */
async function go (reviewChargeReferenceId) {
  const reviewChargeReference = await FetchReviewChargeReferenceService.go(reviewChargeReferenceId)

  const pageData = AuthorisedPresenter.go(reviewChargeReference)

  return {
    pageTitle: 'Set the authorised volume',
    ...pageData
  }
}

module.exports = {
  go
}
