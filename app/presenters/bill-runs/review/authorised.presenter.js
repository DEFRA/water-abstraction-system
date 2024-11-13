'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference authorised page
 * @module AuthorisedPresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const { calculateTotalBillableReturns, formatChargePeriod } = require('./base-review.presenter.js')

/**
 * Formats the review charge reference data ready for presenting in the review charge reference authorised page
 *
 * @param {module:ReviewChargeReference} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference factors page
 */
function go (reviewChargeReference) {
  const {
    amendedAuthorisedVolume,
    chargeReference,
    reviewChargeElements,
    reviewChargeVersion,
    id: reviewChargeReferenceId
  } = reviewChargeReference

  return {
    amendedAuthorisedVolume,
    chargeDescription: chargeReference.chargeCategory.shortDescription,
    chargePeriod: formatChargePeriod(reviewChargeVersion),
    financialPeriod: formatFinancialYear(reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding),
    reviewChargeReferenceId,
    totalBillableReturns: calculateTotalBillableReturns(reviewChargeElements)
  }
}

module.exports = {
  go
}
