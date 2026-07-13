/**
 * Formats the review charge reference data ready for presenting in the review charge reference factors page
 * @module FactorsPresenter
 */

import { formatFinancialYear } from '../../base.presenter.js'
import { formatAdditionalCharges, formatChargePeriod, formatAdjustments } from './base-review.presenter.js'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference factors page
 *
 * @param {module:ReviewChargeReference} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference factors page
 */
export default function (reviewChargeReference) {
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
    pageTitle: 'Set the adjustment factors',
    reviewChargeReferenceId
  }
}
