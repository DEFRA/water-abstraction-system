'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 * @module ReviewChargeReferencePresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const {
  calculateTotalBillableReturns,
  formatAdditionalCharges,
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
function go (reviewChargeReference) {
  const {
    amendedAuthorisedVolume,
    chargeReference,
    reviewChargeElements,
    reviewChargeVersion,
    id: reviewChargeReferenceId
  } = reviewChargeReference

  return {
    additionalCharges: formatAdditionalCharges(chargeReference).join(', '),
    adjustments: _adjustments(reviewChargeReference),
    amendedAuthorisedVolume,
    canAmend: _canAmend(reviewChargeReference),
    chargeCategory: chargeReference.chargeCategory.reference,
    chargeDescription: chargeReference.chargeCategory.shortDescription,
    chargePeriod: formatChargePeriod(reviewChargeVersion),
    financialPeriod: formatFinancialYear(reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding),
    reviewChargeReferenceId,
    reviewLicenceId: reviewChargeVersion.reviewLicence.id,
    totalBillableReturns: calculateTotalBillableReturns(reviewChargeElements)
  }
}

function _adjustments (reviewChargeReference) {
  const {
    abatementAgreement,
    aggregate,
    amendedAggregate,
    amendedChargeAdjustment,
    canalAndRiverTrustAgreement,
    chargeAdjustment,
    twoPartTariffAgreement,
    winterDiscount
  } = reviewChargeReference

  const adjustments = []

  if (aggregate !== 1) {
    adjustments.push(`Aggregate factor (${amendedAggregate})`)
  }

  if (chargeAdjustment !== 1) {
    adjustments.push(`Charge adjustment (${amendedChargeAdjustment})`)
  }

  if (abatementAgreement !== 1) {
    adjustments.push(`Abatement agreement (${abatementAgreement})`)
  }

  if (winterDiscount) {
    adjustments.push('Winter discount')
  }

  if (twoPartTariffAgreement) {
    adjustments.push('Two part tariff agreement')
  }

  if (canalAndRiverTrustAgreement) {
    adjustments.push('Canal and River trust agreement')
  }

  return adjustments
}

function _canAmend (reviewChargeReference) {
  const { aggregate, chargeAdjustment } = reviewChargeReference

  return (aggregate !== 1 || chargeAdjustment !== 1)
}

module.exports = {
  go
}
