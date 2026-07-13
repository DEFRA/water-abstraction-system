/**
 * Formats the review charge reference data ready for presenting in the review charge reference authorised page
 * @module AuthorisedPresenter
 */

import { formatFinancialYear } from '../../base.presenter.js'
import { calculateTotalBillableReturns, formatChargePeriod } from './base-review.presenter.js'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference authorised page
 *
 * @param {module:ReviewChargeReference} reviewChargeReference - instance of the `ReviewChargeReferenceModel`
 * returned from `FetchReviewChargeReferenceService`
 *
 * @returns {object} page date needed for the review charge reference factors page
 */
export default function authorised(reviewChargeReference) {
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
    pageTitle: 'Set the authorised volume',
    totalBillableReturns: calculateTotalBillableReturns(reviewChargeElements)
  }
}
