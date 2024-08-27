'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the edit billable returns page
 * @module AmendBillableReturnsPresenter
 */

const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')
const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and review charge element data for presenting
 *
 * @param {module:BillRunModel} billRun - the data from the bill run
 * @param {module:ReviewChargeElement} reviewChargeElement - the data from the review charge element
 * @param {string} licenceId - the UUID of the licence being reviewed
 *
 * @returns {object} the prepared bill run and charge element data to be passed to the edit billable returns page
 */
function go (billRun, reviewChargeElement, licenceId) {
  return {
    chargeElement: {
      description: reviewChargeElement.chargeElement.description,
      dates: _prepareChargeElementDates(
        reviewChargeElement.chargeElement,
        reviewChargeElement.reviewChargeReference.reviewChargeVersion
      ),
      reviewChargeElementId: reviewChargeElement.id
    },
    billRun: {
      id: billRun.id,
      financialYear: _financialYear(billRun.toFinancialYearEnding)
    },
    chargeVersion: {
      chargePeriod: _prepareDate(
        reviewChargeElement.reviewChargeReference.reviewChargeVersion.chargePeriodStartDate,
        reviewChargeElement.reviewChargeReference.reviewChargeVersion.chargePeriodEndDate
      )
    },
    licenceId,
    authorisedQuantity: _authorisedQuantity(reviewChargeElement)
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

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _prepareChargeElementDates (chargeElement, chargeVersion) {
  const chargePeriod = {
    startDate: chargeVersion.chargePeriodStartDate,
    endDate: chargeVersion.chargePeriodEndDate
  }

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

  const dates = []

  // NOTE: There can be more than 1 abstraction period for an element, hence why we loop through them
  abstractionPeriods.forEach((abstractionPeriod) => {
    dates.push(_prepareDate(abstractionPeriod.startDate, abstractionPeriod.endDate))
  })

  return dates
}

function _prepareDate (startDate, endDate) {
  const preparedStartDate = formatLongDate(startDate)
  const preparedEndDate = formatLongDate(endDate)

  return `${preparedStartDate} to ${preparedEndDate}`
}

module.exports = {
  go
}
