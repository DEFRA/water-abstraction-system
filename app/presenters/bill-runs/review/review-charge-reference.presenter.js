/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 * @module ReviewChargeReferencePresenter
 */

import { formatFinancialYear } from '../../base.presenter.js'
import {
  calculateTotalBillableReturns,
  formatAdditionalCharges,
  formatAdjustments,
  formatChargePeriod
} from './base-review.presenter.js'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference page
 *
 * @param {module:ReviewChargeReferenceModel} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference page
 */
export default function reviewChargeReferencePresenter(reviewChargeReference) {
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
    pageTitle: 'Review charge reference',
    reviewChargeReferenceId,
    reviewLicenceId: reviewChargeVersion.reviewLicence.id,
    totalBillableReturns: calculateTotalBillableReturns(reviewChargeElements)
  }
}

function _factors(reviewChargeReference, canAmend) {
  const { aggregate, amendedAggregate, amendedChargeAdjustment, chargeAdjustment } = reviewChargeReference

  const factors = []

  if (canAmend) {
    factors.push(
      `Aggregate factor (${amendedAggregate} / ${aggregate})`,
      `Charge adjustment (${amendedChargeAdjustment} / ${chargeAdjustment})`
    )
  }

  return factors
}

function _canAmend(reviewChargeReference) {
  const { aggregate, chargeAdjustment } = reviewChargeReference

  return aggregate !== 1 || chargeAdjustment !== 1
}
