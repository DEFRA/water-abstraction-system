'use strict'

/**
 * Determines which financial year ends are between the date ranges
 * @module DetermineBillingYearsService
 */

const { determineCurrentFinancialYearEnd } = require('../../../lib/dates.lib.js')

const LAST_PRE_SROC_FINANCIAL_YEAR_END = 2022

/**
 * Determines the financial years impacted by changes between the start date and end dates, considering only the
 * financial year ends that are relevant for SROC supplementary billing.
 *
 * It determines the financial year ends for the given `startDate` and `endDate`, and returns
 * an array of years that are greater than the last pre-SROC financial year end.
 *
 * @param {Date} startDate - The start date from which to begin calculating financial years.
 * @param {Date} endDate - The end date up to which to calculate financial years. If not provided,
 * the current date will be used.
 *
 * @returns {object[]} - The financial year end that are impacted by the changes between the start and end dates and are
 * relevant for SROC.
 */
function go(startDate, endDate) {
  const years = []

  const startYear = determineCurrentFinancialYearEnd(startDate)
  // As some changes don't have an end date we need to take this into consideration
  const endYear = determineCurrentFinancialYearEnd(endDate || new Date())

  for (let year = startYear; year <= endYear; year++) {
    // SROC supplementary billing started in the financial year 2022/2023. Anything before this year is not considered
    // to be SROC
    if (year > LAST_PRE_SROC_FINANCIAL_YEAR_END) {
      years.push(year)
    }
  }

  return years
}

module.exports = {
  go
}
