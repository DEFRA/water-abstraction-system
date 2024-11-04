'use strict'

const { formatLongDate } = require('../../base.presenter.js')
const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')

/**
 * Formats the charge period into its string variant, for example, '1 April 2023 to 10 October 2023'
 *
 * @param {module:ReviewChargeVersionModel} reviewChargeVersion - instance of `ReviewChargeVersionModel` to format the
 * charge period for
 *
 * @returns {string} The review charge version's charge period formatted as a 'DD MMMM YYYY to DD MMMM YYYY' string
 */
function formatChargePeriod (reviewChargeVersion) {
  const chargePeriod = _chargePeriod(reviewChargeVersion)

  return `${formatLongDate(chargePeriod.startDate)} to ${formatLongDate(chargePeriod.endDate)}`
}

/**
 * Determine the charge periods for a `ReviewChargeElementModel` and format them for display
 *
 * If the charge period is known, for example, the review licence presenter determines first and then passes it to
 * various functions, then this can be provided. Else the function will assume the `ReviewChargeElementModel` instance
 * contains a `reviewChargeReference` property that then contains a `reviewChargeVersion`. The charge period will be
 * determined by extracting the start and end date from it.
 *
 * With the abstraction details and charge period determined, it calls `DetermineAbstractionPeriodService` to calculate
 * the charge periods for the _element_. An element can have 1 or 2 charge periods, due to the way abstraction periods
 * and financial years cross-over.
 *
 * With these calculated, they are passed through `formatLongDate()` and return for display in the UI.
 *
 * @param {module:ReviewChargeElementModel} reviewChargeElement - instance of `ReviewChargeElementModel` containing at
 * least a `chargeElement` property populated with abstraction days and months
 * @param {*} [chargePeriod]
 *
 * @returns {string[]} an array containing the review charge element's charge period(s) formatted as 'DD MMMM YYYY to DD
 * MMMM YYYY'
 */
function formatChargePeriods (reviewChargeElement, chargePeriod = null) {
  const { chargeElement, reviewChargeReference } = reviewChargeElement

  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  if (!chargePeriod) {
    chargePeriod = _chargePeriod(reviewChargeReference.reviewChargeVersion)
  }

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

function _chargePeriod (reviewChargeVersion) {
  const { chargePeriodStartDate, chargePeriodEndDate } = reviewChargeVersion

  return { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate }
}

module.exports = {
  formatChargePeriod,
  formatChargePeriods
}
