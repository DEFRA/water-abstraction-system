'use strict'

/**
 * Consolidates an array of date ranges by merging overlapping ranges, returning an array of the resulting date ranges
 * @module ConsolidateDateRangesService
 */

/**
 * Consolidate date ranges by merging all overlapping ranges and returning an array of the resulting ranges. Note that
 * the returned range will be sorted in order of start date, from earliest to latest.
 *
 * Say we have the following dates:
 *
 * ```javascript
 * [
 *   { startDate: 2023-01-01, endDate: 2023-03-01 }, // Range 1
 *   { startDate: 2023-02-01, endDate: 2023-04-01 }, // Range 2
 *   { startDate: 2023-06-01, endDate: 2023-07-01 }  // Range 3
 * ]
 * ```
 *
 * The first two date ranges overlap (as the second one starts before the first one ends) so we merge them into one date
 * range. The third date range does not overlap anything, so we leave it alone. Our resulting consolidated date ranges
 * therefore looks like this:
 *
 * ```javascript
 * [
 *   { startDate: 2023-01-01, endDate: 2023-04-01 }, // Ranges 1 & 2 merged
 *   { startDate: 2023-06-01, endDate: 2023-07-01 }  // Range 3 unchanged
 * ]
 * ```
 *
 * Note that if a range starts on the same day the previous range ends, that is classed as one continuous range. But a
 * range that starts the day _after_ the previous range ends is classed as a separate range to that previous one. eg:
 *
 * ```javascript
 * [
 *   { startDate: 2023-01-01, endDate: 2023-04-01 }, // Range 1, ending on 1st April
 *   { startDate: 2023-04-01, endDate: 2023-07-01 }, // Range 2, starting on 1st April
 *   { startDate: 2023-10-01, endDate: 2023-10-31 }, // Range 3, ending on 31st October
 *   { startDate: 2023-11-01, endDate: 2023-12-01 }  // Range 4, starting on 1st November
 * ]
 * ```
 *
 * Consolidates to:
 *
 * ```javascript
 * [
 *   { startDate: 2023-01-01, endDate: 2023-07-01 }, // Ranges 1 & 2 merged
 *   { startDate: 2023-10-01, endDate: 2023-10-31 }, // Range 3 unchanged
 *   { startDate: 2023-11-01, endDate: 2023-12-01 }  // Range 4 unchanged
 * ]
 * ```
 *
 * @param {object[]} dateRanges - The series of date ranges to be consolidated.
 * @param {Date} dateRanges[].startDate - The start date for the range
 * @param {Date} dateRanges[].endDate - The end date of the range
 *
 * @returns {object[]} An array of the consolidated date ranges
 */
function go (dateRanges) {
  // We sort the date ranges by start date from earliest to latest to make life easier when consolidating them
  const sortedDates = _sortDates(dateRanges)

  const consolidatedDateRanges = _consolidateDates(sortedDates)

  return consolidatedDateRanges
}

function _sortDates (dateRanges) {
  return dateRanges.sort((a, b) => {
    return a.startDate - b.startDate
  })
}

/**
 * Consolidate date ranges by merging any which overlap. Relies on the date ranges being sorted from earliest start date
 * to latest start date as we iterate over the date ranges and compare each one to the previous one to determine whether
 * or not they overlap.
 *
 * Based on https://stackoverflow.com/a/67717721
 *
 * @private
 */
function _consolidateDates (dateRanges) {
  // We use reduce to build up an array of consolidated date ranges as we iterate over our initial dateRanges array.
  // Each time round we compare the current range from dateRanges with the one we previously added to our array of
  // consolidated ranges to see if it overlaps, which determines what we add to our ongoing array before we iterate
  // again over the next item in dateRanges
  return dateRanges.reduce((acc, currentRange) => {
    // If this is the first range then there's nothing else to check yet so simply add it to our ongoing acc array
    if (acc.length === 0) {
      return [currentRange]
    }

    // Get the last date range we added to acc. We use pop (which removes it from the acc array) as we may end up
    // replacing it entirely if the current date range overlaps it
    const previousRange = acc.pop()

    // If the current end date is before the previous end date then the current range is completely inside the previous
    // one so we simply add the previous one back to our ongoing acc array
    if (currentRange.endDate <= previousRange.endDate) {
      return [...acc, previousRange]
    }

    // If the current range's start date is on or earlier than the previous end date then the current range overlaps
    // (starting the same day as the previous one ends counts as overlapping) so we add a new date range to our ongoing
    // acc array, starting when the previous range starts and ending when the current range ends
    if (currentRange.startDate <= previousRange.endDate) {
      return [...acc, { startDate: previousRange.startDate, endDate: currentRange.endDate }]
    }

    // If ranges don't overlap then simply add the previous _and_ current ranges to our ongoing acc array
    return [...acc, previousRange, currentRange]
  },
  // Start with an empty array
  [])
}

module.exports = {
  go
}
