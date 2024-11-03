'use strict'

/**
 * Formats the review charge reference data ready for presenting in the review charge reference authorised page
 * @module AuthorisedPresenter
 */

const Big = require('big.js')

const { formatFinancialYear } = require('../../base.presenter.js')

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
    chargePeriod: reviewChargeVersion.$formatChargePeriod(),
    financialPeriod: formatFinancialYear(reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding),
    reviewChargeReferenceId,
    totalBillableReturns: _totalBillableReturns(reviewChargeElements)
  }
}

function _totalBillableReturns (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    const { amendedAllocated } = reviewChargeElement

    return Big(total).plus(amendedAllocated).toNumber()
  }, 0)
}

module.exports = {
  go
}
