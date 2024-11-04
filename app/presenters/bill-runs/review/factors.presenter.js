'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference factors page
 * @module FactorsPresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const { formatAdditionalCharges, formatChargePeriod } = require('./base-review.presenter.js')

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
  const adjustments = _adjustments(reviewChargeReference)

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

function _adjustments (reviewChargeReference) {
  const {
    abatementAgreement,
    canalAndRiverTrustAgreement,
    twoPartTariffAgreement,
    winterDiscount
  } = reviewChargeReference

  const adjustments = []

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

module.exports = {
  go
}
