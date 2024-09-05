'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the charge reference details page in a two-part tariff bill
 * run
 * @module ChargeReferenceDetailsService
 */

const ChargeReferenceDetailsPresenter = require('../../../presenters/bill-runs/two-part-tariff/charge-reference-details.presenter.js')
const FetchReviewChargeReferenceService = require('./fetch-review-charge-reference.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the charge reference details page in a two-part tariff bill
 * run
 *
 * @param {string} billRunId - The UUID for the bill run
 * @param {string} licenceId - The UUID of the licence that is being reviewed
 * @param {string} reviewChargeReferenceId - The UUID of the charge reference being reviewed
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} the 'pageData' needed for the review charge reference page. It contains details of the
 * bill run, charge reference and the charge adjustments
 */
async function go (billRunId, licenceId, reviewChargeReferenceId, yar) {
  const {
    billRun,
    reviewChargeReference
  } = await FetchReviewChargeReferenceService.go(billRunId, reviewChargeReferenceId)

  const [bannerMessage] = yar.flash('banner')
  const [chargeMessage] = yar.flash('charge')
  const pageData = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

  return {
    bannerMessage,
    chargeMessage,
    ...pageData
  }
}

module.exports = {
  go
}
