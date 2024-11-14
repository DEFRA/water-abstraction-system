'use strict'

/**
 * Formats the review charge element data ready for presenting in the review charge element page
 * @module ReviewChargeElementPresenter
 */

const { formatAbstractionPeriod, formatFinancialYear, formatLongDate } = require('../../base.presenter.js')
const {
  determineReturnLink,
  formatChargePeriod,
  formatChargePeriods,
  formatIssues,
  formatReturnStatus,
  formatReturnTotals
} = require('./base-review.presenter.js')

/**
 * Formats the review charge element data ready for presenting in the review charge element page
 *
 * @param {module:ReviewChargeElement} reviewChargeElement - instance of the `ReviewChargeElementModel`
 * returned from `FetchReviewChargeElementService`
 * @param {number} elementIndex - the index of the element within all charge elements for the charge reference. This
 * helps users relate which element they are reviewing to the one they selected on the review licence screen
 *
 * @returns {object} page date needed for the review charge element page
 */
function go (reviewChargeElement, elementIndex) {
  const {
    amendedAllocated: billableReturns,
    chargeElement,
    id: reviewChargeElementId,
    issues,
    reviewChargeReference,
    status
  } = reviewChargeElement

  return {
    authorisedVolume: chargeElement.authorisedAnnualQuantity,
    billableReturns,
    chargeDescription: chargeElement.description,
    chargePeriod: formatChargePeriod(reviewChargeReference.reviewChargeVersion),
    chargePeriods: formatChargePeriods(reviewChargeElement),
    elementCount: reviewChargeReference.reviewChargeElements.length,
    elementIndex,
    financialPeriod: formatFinancialYear(
      reviewChargeReference.reviewChargeVersion.reviewLicence.billRun.toFinancialYearEnding
    ),
    issues: formatIssues(issues),
    licenceId: reviewChargeReference.reviewChargeVersion.reviewLicence.licenceId,
    matchedReturns: _matchedReturns(reviewChargeElement.reviewReturns),
    reviewChargeElementId,
    reviewLicenceId: reviewChargeReference.reviewChargeVersion.reviewLicence.id,
    status
  }
}

function _matchedReturns (reviewReturns) {
  return reviewReturns.map((reviewReturn) => {
    const { description, endDate, issues, purposes, returnLog, returnId, returnReference, startDate } = reviewReturn
    const { periodStartDay, periodStartMonth, periodEndDay, periodEndMonth } = returnLog

    return {
      abstractionPeriod: formatAbstractionPeriod(periodStartDay, periodStartMonth, periodEndDay, periodEndMonth),
      description,
      issues: formatIssues(issues),
      purpose: purposes[0].tertiary.description,
      reference: returnReference,
      returnId,
      returnLink: determineReturnLink(reviewReturn),
      returnPeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      returnStatus: formatReturnStatus(reviewReturn),
      returnTotal: formatReturnTotals(reviewReturn)
    }
  })
}

module.exports = {
  go
}
