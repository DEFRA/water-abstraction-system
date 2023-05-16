'use strict'

/**
 * Calculates billing periods needed when generating a supplementary bill run
 * @module BillingPeriodService
 */

/**
 * Returns the billing periods needed when generating a supplementary bill run
 *
 * Using the current date at the time the service is called, it calculates the billing periods to use. We permit
 * changes to charge versions to be retroactively applied up to 5 years. So, a bill run generated in 2022 would need to
 * consider every financial year back to 2017.
 *
 * The exception to that is the change in charge scheme that happened in 2022, when we moved from ALCS (or PRESROC) to
 * SROC. Changes prior to 2022 would only apply to a ALCS bill run and vice versa.
 *
 * @returns {Object[]} An array of billing periods each containing a `startDate` and `endDate`.
 */
function go () {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const billingPeriod = []
  const earliestSrocFinYearEnd = 2023

  // 01-APR to 31-MAR
  const financialPeriod = {
    start: { day: 1, month: 3 },
    end: { day: 31, month: 2 }
  }

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

  while (earliestSrocFinYearEnd <= endYear) {
    billingPeriod.push({
      startDate: new Date(startYear, financialPeriod.start.month, financialPeriod.start.day),
      endDate: new Date(endYear, financialPeriod.end.month, financialPeriod.end.day)
    })
    startYear--
    endYear--
  }

  return billingPeriod
}

module.exports = {
  go
}
