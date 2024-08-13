'use strict'

/**
 * Works out which financial year ends are between the date ranges
 * @module SupplementaryBillingYearsService
 */

const MONTHS_UNTIL_FINANCIAL_YEAR_START = 3
const LAST_PRE_SROC_FINANCIAL_YEAR_END = 2022

/**
 * Calculates the financial years impacted by changes between the start date and end dates, considering only the
 * financial year ends that are relevant for SROC supplementary billing.
 *
 * It determines the financial year ends for the given `startDate` and `endDate`, and returns
 * an array of years that are greater than the last pre-SROC financial year end.
 *
 * @param {Date} startDate - The start date from which to begin calculating financial years.
 * @param {Date} endDate - The end date up to which to calculate financial years. If not provided,
 * the current date will be used.
 *
 * @returns {Object[]} - An array of financial year end years that are impacted by the changes between the
 * start and end dates and are relevant for SROC.
 */
function go (startDate, endDate) {
  const years = []

  const startYear = _getAdjustedFinancialYearEnd(startDate)
  // As some changes don't have an end date we need to take this into consideration
  const endYear = _getAdjustedFinancialYearEnd(endDate || new Date())

  for (let year = startYear; year <= endYear; year++) {
    // SROC supplementary billing started in the financial year 2022/2023. Anything before this year is not considered
    // to be SROC
    if (year > LAST_PRE_SROC_FINANCIAL_YEAR_END) {
      years.push(year)
    }
  }

  return years
}

/**
 * When flagging a licence for the supplementary bill run, we need to consider which financial years have been
 * impacted by the change. We only care about the financial year ends. So if the startDate for a new chargeVersion is
 * `2022-05-31`, the financial year end is considered to be `2023` since the financial years run April to March. Same
 * goes for if a charge versions endDate is `2024-04-05`, the financial year end is `2025`.
 */
function _getAdjustedFinancialYearEnd (date) {
  let year = date.getFullYear()

  if (date.getMonth() >= MONTHS_UNTIL_FINANCIAL_YEAR_START) {
    year++
  }

  return year
}

module.exports = {
  go
}
