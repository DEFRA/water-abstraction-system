'use strict'

/**
 * Determine the billing periods needed when generating an SROC supplementary bill run
 * @module DetermineBillingPeriodsService
 */

/**
 * Returns the billing periods needed when generating an SROC supplementary bill run
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

  const years = _determineStartAndEndYear(financialPeriod)
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

function _determineStartAndEndYear (financialPeriod) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  let startYear
  let endYear

  // IMPORTANT! getMonth returns an integer (0-11). So, January is represented as 0 and December as 11. This is why
  // financialPeriod.end.month is 2 rather than 3, even though we mean March
  if (currentDate.getMonth() <= financialPeriod.end.month) {
    // For example, if currentDate was 2022-02-15 it would fall in financial year 2021-04-01 to 2022-03-31
    startYear = currentYear - 1
    endYear = currentYear
  } else {
    // For example, if currentDate was 2022-06-15 it would fall in financial year 2022-04-01 to 2023-03-31
    startYear = currentYear
    endYear = currentYear + 1
  }

  return { startYear, endYear }
}

module.exports = {
  go
}
