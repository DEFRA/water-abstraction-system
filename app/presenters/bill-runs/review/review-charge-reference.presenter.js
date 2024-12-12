'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 * @module ReviewChargeReferencePresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const {
  calculateTotalBillableReturns,
  formatAdditionalCharges,
  formatAdjustments,
  formatChargePeriod
} = require('./base-review.presenter.js')

/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 *
 * @param {module:ReviewChargeReferenceModel} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference page
 */
function go(reviewChargeReference) {
  const {
    amendedAuthorisedVolume,
    chargeReference,
    reviewChargeElements,
    reviewChargeVersion,
    id: reviewChargeReferenceId
  } = reviewChargeReference

  const canAmend = _canAmend(reviewChargeReference)
  const adjustments = formatAdjustments(reviewChargeReference)
  const factors = _factors(reviewChargeReference, canAmend)

  return {
    additionalCharges: formatAdditionalCharges(chargeReference).join(', '),
    adjustments: [...factors, ...adjustments],
    amendedAuthorisedVolume,
    canAmend,
    chargeCategory: chargeReference.chargeCategory.reference,
    chargeDescription: chargeReference.chargeCategory.shortDescription,
    chargePeriod: formatChargePeriod(reviewChargeVersion),
    financialPeriod: formatFinancialYear(reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding),
    reviewChargeReferenceId,
    reviewLicenceId: reviewChargeVersion.reviewLicence.id,
    totalBillableReturns: calculateTotalBillableReturns(reviewChargeElements)
  }
}

function _factors(reviewChargeReference, canAmend) {
  const { aggregate, amendedAggregate, amendedChargeAdjustment, chargeAdjustment } = reviewChargeReference

  const factors = []

  if (canAmend) {
    factors.push(`Aggregate factor (${amendedAggregate} / ${aggregate})`)
    factors.push(`Charge adjustment (${amendedChargeAdjustment} / ${chargeAdjustment})`)
  }

  return factors
}

function _canAmend(reviewChargeReference) {
  const { aggregate, chargeAdjustment } = reviewChargeReference

  return aggregate !== 1 || chargeAdjustment !== 1
}

module.exports = {
  go
}
