'use strict'

/**
 * Formats the review charge element data ready for presenting in the review charge element edit page
 * @module EditPresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const { formatChargePeriod, formatChargePeriods } = require('./base-review.presenter.js')

/**
 * Prepares and processes bill run and review charge element data for presenting
 *
 * @param {module:ReviewChargeElement} reviewChargeElement - instance of the `ReviewChargeElementModel`
 * returned from `FetchReviewChargeElementService`
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are reviewing to the one they selected on the review licence screen
 *
 * @returns {object} the prepared bill run and charge element data to be passed to the edit billable returns page
 */
function go (reviewChargeElement, elementIndex) {
  const {
    amendedAllocated: billableReturns,
    chargeElement,
    id: reviewChargeElementId,
    reviewChargeReference
  } = reviewChargeElement

  return {
    authorisedQuantity: _authorisedQuantity(reviewChargeElement),
    billableReturns,
    chargeDescription: chargeElement.description,
    chargePeriod: formatChargePeriod(reviewChargeReference.reviewChargeVersion),
    chargePeriods: formatChargePeriods(reviewChargeElement),
    elementIndex,
    financialPeriod: formatFinancialYear(
      reviewChargeReference.reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding
    ),
    reviewChargeElementId
  }
}

/**
 * The user can only enter a volume on the billable returns that is less than the authorised volume. The authorised
 * volume is either the authorised volume on the charge element or the authorised volume on the charge reference.
 * Whichever is lower.
 *
 * @private
 */
function _authorisedQuantity (reviewChargeElement) {
  const { chargeElement, reviewChargeReference } = reviewChargeElement

  return Math.min(chargeElement.authorisedAnnualQuantity, reviewChargeReference.amendedAuthorisedVolume)
}

module.exports = {
  go
}
