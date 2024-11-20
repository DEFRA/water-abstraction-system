'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference factors page
 * @module FactorsPresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const { formatAdditionalCharges, formatChargePeriod, formatAdjustments } = require('./base-review.presenter.js')

/**
 * Formats the review charge reference data ready for presenting in the review charge reference factors page
 *
 * @param {module:ReviewChargeReference} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference factors page
 */
function go (reviewChargeReference) {
  const {
    amendedAggregate,
    amendedChargeAdjustment,
    chargeReference,
    reviewChargeVersion,
    id: reviewChargeReferenceId
  } = reviewChargeReference

  const additionalCharges = formatAdditionalCharges(chargeReference)
  const adjustments = formatAdjustments(reviewChargeReference)

  return {
    amendedAggregate,
    amendedChargeAdjustment,
    chargeDescription: chargeReference.chargeCategory.shortDescription,
    chargePeriod: formatChargePeriod(reviewChargeVersion),
    financialPeriod: formatFinancialYear(reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding),
    otherAdjustments: [...additionalCharges, ...adjustments],
    reviewChargeReferenceId
  }
}

module.exports = {
  go
}
