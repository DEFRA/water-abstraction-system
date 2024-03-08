'use strict'

/**
 * Determine the billing periods needed when generating a bill run
 * @module DetermineBillingPeriodsService
 */

const { determineCurrentFinancialYear } = require('../../lib/general.lib.js')

/**
 * Returns the billing periods needed when generating a bill run
 *
 * Using the current date at the time the service is called, it calculates the billing periods to use. As we permit
 * changes to charge versions to be retroactively applied for up to 5 years. This service will calculate the billing
 * periods for the current year plus a maximum of the previous 5 years. Or to the earliest possible `endYear` for SROC
 * which is 2023, whichever is the greatest.
 *
 * If a `financialYearEnding` is passed to this service a single billing period will be generated based on that value.
 *
 * @param {Number} financialYearEnding End year of the bill run. Only populated for two-part-tariff
 *
 * @returns {Object[]} An array of billing periods each containing a `startDate` and `endDate`.
 */
function go (financialYearEnding) {
  const SROC_FIRST_FIN_YEAR_END = 2023
  const NO_OF_YEARS_TO_LOOK_BACK = 5

  const currentFinancialYear = determineCurrentFinancialYear()

  const billingPeriods = []

  // 01-APR to 31-MAR
  const financialPeriod = {
    start: { day: 1, month: 3 },
    end: { day: 31, month: 2 }
  }

  // Two-part-tariff bill runs will always be a single period and will provide a value for `financialYearEnding` so we
  // just return a single period based on that value. `financialYearEnding` is null for other bill run types.
  if (financialYearEnding) {
    _addBillingPeriod(billingPeriods, financialPeriod, financialYearEnding - 1, financialYearEnding)

    return billingPeriods
  }

  const years = { startYear: currentFinancialYear.startDate.getFullYear(), endYear: currentFinancialYear.endDate.getFullYear() }
  const earliestSrocFinYearEnd = Math.max(SROC_FIRST_FIN_YEAR_END, (years.endYear - NO_OF_YEARS_TO_LOOK_BACK))

  while (earliestSrocFinYearEnd <= years.endYear) {
    _addBillingPeriod(billingPeriods, financialPeriod, years.startYear, years.endYear)

    years.startYear--
    years.endYear--
  }

  return billingPeriods
}

function _addBillingPeriod (billingPeriods, financialPeriod, startYear, endYear) {
  billingPeriods.push({
    startDate: new Date(startYear, financialPeriod.start.month, financialPeriod.start.day),
    endDate: new Date(endYear, financialPeriod.end.month, financialPeriod.end.day)
  })
}

module.exports = {
  go
}
