'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the charge reference details page in a two-part tariff bill
 * run
 * @module ChargeReferenceDetailsService
 */

const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')
const ChargeReferenceDetailsPresenter = require('../../../presenters/bill-runs/two-part-tariff/charge-reference-details.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the charge reference details page in a two-part tariff bill
 * run
 *
 * @param {String} billRunId - The UUID for the bill run
 * @param {String} licenceId - The UUID of the licence that is being reviewed
 * @param {String} reviewChargeReferenceId - The UUID of the charge reference being reviewed
 *
 * @returns {Promise<Object>} the 'pageData' needed for the review licence page. It contains the licence, bill run,
 * matched and unmatched returns and the licence charge data
 */
async function go (billRunId, licenceId, reviewChargeReferenceId) {
  const { billRun, reviewChargeReference } = await FetchReviewChargeReferenceService.go(billRunId, reviewChargeReferenceId)

  const pageData = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

  return pageData
}

module.exports = {
  go
}
