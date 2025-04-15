'use strict'

/**
 * Formats meter reading data ready for presenting in the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module ReadingsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Format data for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {module:SessionModel} session - The returns log session instance
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {object} page data needed by the view template
 */
function go(session, yearMonth) {
  const { id: sessionId, lines, returnReference } = session

  const [requestedYear, requestedMonth] = _determineRequestedYearAndMonth(yearMonth)

  const requestedMonthLines = lines.filter((line) => {
    const endDate = new Date(line.endDate)

    return endDate.getFullYear() === requestedYear && endDate.getMonth() === requestedMonth
  })

  return {
    backLink: `/system/return-logs/setup/${sessionId}/check`,
    inputLines: _inputLines(requestedMonthLines),
    pageTitle: _pageTitle(new Date(requestedMonthLines[0].endDate)),
    returnReference
  }
}

function _determineRequestedYearAndMonth(yearMonth) {
  // Splitting a string like `2014-0` by the dash gives us an array of strings ['2014', '0']. We chain `.map(Number)` to
  // then create a new array, applying the Number() function to each one. The result is an array of numbers [2014, 0].
  return yearMonth.split('-').map(Number)
}

function _inputLines(lines) {
  return lines.map((line) => {
    const { endDate, reading } = line

    const lineData = {
      endDate,
      formattedEndDate: formatLongDate(new Date(endDate)),
      reading
    }

    if (line.error) {
      lineData.error = line.error
    }

    return lineData
  })
}

function _pageTitle(date) {
  const titleDate = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })

  return `Water abstracted ${titleDate}`
}

module.exports = {
  go
}
