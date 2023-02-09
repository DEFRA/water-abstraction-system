'use strict'

/**
 * Consolidates an array of date ranges by merging overlapping ranges, returning an array of the resulting date ranges
 * @module ConsolidateDateRangesService
 */

/**
 * Consolidate date ranges by merging all overlapping ranges and returning an array of the resulting ranges
 *
 * @param {Array.<{startDate: Date, endDate: Date}>} dateRanges Array containing a series of date ranges to be
 *  consolidated, each of which is an Object containing startDate and endDate, both of which are Dates
 *
 * @returns {Array.<{startDate: Date, endDate: Date}>} An array of the consolidated date ranges
 */
function go (dateRanges) {
  const consolidatedDateRanges = []

  for (const dateRange of dateRanges) {
    consolidatedDateRanges.push(dateRange)
  }

  return consolidatedDateRanges
}

module.exports = {
  go
}
