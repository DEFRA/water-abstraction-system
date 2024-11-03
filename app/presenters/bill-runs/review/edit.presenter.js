'use strict'

/**
 * Formats the review charge element data ready for presenting in the review charge element edit page
 * @module EditPresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatFinancialYear, formatLongDate } = require('../../base.presenter.js')

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

  const chargePeriod = _chargePeriod(reviewChargeReference.reviewChargeVersion)

  return {
    authorisedQuantity: _authorisedQuantity(reviewChargeElement),
    billableReturns,
    chargeDescription: chargeElement.description,
    chargePeriod: `${formatLongDate(chargePeriod.startDate)} to ${formatLongDate(chargePeriod.endDate)}`,
    chargePeriods: _chargePeriods(chargeElement, chargePeriod),
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

function _chargePeriod (reviewChargeVersion) {
  const { chargePeriodStartDate, chargePeriodEndDate } = reviewChargeVersion

  return { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate }
}

function _chargePeriods (chargeElement, chargePeriod) {
  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  return abstractionPeriods.map((abstractionPeriod) => {
    const { endDate, startDate } = abstractionPeriod

    return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
  })
}

module.exports = {
  go
}
