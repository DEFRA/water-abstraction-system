'use strict'

/**
 * Determine the billing periods needed when generating a bill run
 * @module DetermineBillingPeriodsService
 */

const { determineCurrentFinancialYear } = require('../../lib/general.lib.js')

// NOTE: Because of the unique qualities of Javascript, Year and Day are literal values, month is an index! So,
// January is actually 0, February is 1 etc. This is why we are always deducting 1 from the months.
const APRIL = 3
const MARCH = 2
const NO_OF_YEARS_TO_LOOK_BACK = 5
const SROC_FIRST_FIN_YEAR_END = 2023

/**
 * Determine the billing periods needed when generating a bill run
 *
 * Using the `financialYearEnding` provided we first determine the financial start and end date for that financial year.
 * If no `financialYearEnding` is provided we use the current financial year.
 *
 * If the bill run type is 'annual' or 'two_part_tariff' we just return that billing period.
 *
 * If the bill run type is 'supplementary' we then need to calculate a range of up to 6 billing periods back to
 * 2022-2023. The service supports corrections and changes being made to charge version information in the current
 * financial year plus 5. We limit this to 2022-2023 as that is the first SROC year (and we don't handle PRESROC!)
 *
 * Our 3 billing engines then use these periods to generate the bill run.
 *
 * @param {string} billRunType - The type of bill run, for example, 'annual' or 'supplementary'
 * @param {number} [financialYearEnding] - End year of the bill run. Only populated for two-part-tariff
 *
 * @returns {object[]} An array of billing periods each containing a `startDate` and `endDate`.
 */
function go (billRunType, financialYearEnding) {
  const financialYear = _financialYear(financialYearEnding)

  return _billingPeriods(billRunType, financialYear)
}

function _addBillingPeriod (billingPeriods, startYear, endYear) {
  billingPeriods.push({
    startDate: new Date(startYear, APRIL, 1),
    endDate: new Date(endYear, MARCH, 31)
  })
}

function _billingPeriods (billRunType, financialYear) {
  const billingPeriods = []

  const years = { startYear: financialYear.startDate.getFullYear(), endYear: financialYear.endDate.getFullYear() }

  // Annual and two-part-tariff bill runs will always be a single period
  if (['annual', 'two_part_tariff'].includes(billRunType)) {
    _addBillingPeriod(billingPeriods, years.startYear, years.endYear)

    return billingPeriods
  }

  // For example, years.endYear is 2024. So Math.max(2023, 2019) results in 2023 being the earliest year
  // If years.endYear is 2029. So Math.max(2023, 2024) results in 2024 being the earliest year we go back to
  // It means we'll never pick a PRESROC for our billing periods. But also we are future proofed should we still be
  // here in 2029!
  const earliestSrocFinYearEnd = Math.max(SROC_FIRST_FIN_YEAR_END, (years.endYear - NO_OF_YEARS_TO_LOOK_BACK))

  while (earliestSrocFinYearEnd <= years.endYear) {
    _addBillingPeriod(billingPeriods, years.startYear, years.endYear)

    years.startYear--
    years.endYear--
  }

  return billingPeriods
}

/**
 * TODO: Whilst we still have `POST /bill-runs` to support bill runs created using the legacy setup bill run journey we
 * can receive requests where financialYearEnding has not been set. This exists to handle that scenario and can be
 * deleted when we are confident we can delete that end point.
 *
 * @private
 */
function _financialYear (financialYearEnding) {
  if (financialYearEnding) {
    return {
      startDate: new Date(financialYearEnding - 1, APRIL, 1),
      endDate: new Date(financialYearEnding, MARCH, 31)
    }
  }

  return determineCurrentFinancialYear()
}

module.exports = {
  go
}
