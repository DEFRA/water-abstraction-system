'use strict'

/**
 * Format data for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 * @module ReadingsPresenter
 */

const { formatDateMonthYear, formatLongDate } = require('../../base.presenter.js')

/**
 * Format data for the `/return-logs/setup/{sessionId}/readings/{yearMonth}` page
 *
 * @param {module:SessionModel} session - The returns log session instance
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {object} page data needed by the view template
 */
function go(session, yearMonth) {
  const { id: sessionId, lines, returnsFrequency, returnReference } = session

  const [requestedYear, requestedMonth] = _determineRequestedYearAndMonth(yearMonth)

  const requestedMonthLines = lines.filter((line) => {
    const endDate = new Date(line.endDate)

    return endDate.getFullYear() === requestedYear && endDate.getMonth() === requestedMonth
  })

  return {
    backLink: { href: `/system/return-logs/setup/${sessionId}/check`, text: 'Back' },
    pageTitleCaption: `Return reference ${returnReference}`,
    inputLines: _inputLines(requestedMonthLines, returnsFrequency),
    pageTitle: _pageTitle(new Date(requestedMonthLines[0].endDate))
  }
}

function _determineRequestedYearAndMonth(yearMonth) {
  // Splitting a string like `2014-0` by the dash gives us an array of strings ['2014', '0']. We chain `.map(Number)` to
  // then create a new array, applying the Number() function to each one. The result is an array of numbers [2014, 0].
  return yearMonth.split('-').map(Number)
}

function _inputLines(lines, returnsFrequency) {
  return lines.map((line) => {
    const { endDate, reading } = line

    const lineData = {
      endDate,
      label: _lineLabel(endDate, returnsFrequency),
      reading
    }

    if (line.error) {
      lineData.error = line.error
    }

    return lineData
  })
}

function _lineLabel(endDate, returnsFrequency) {
  const labelDate = new Date(endDate)

  if (returnsFrequency === 'week') {
    return `Week ending ${formatLongDate(labelDate)}`
  }

  if (returnsFrequency === 'month') {
    return formatDateMonthYear(labelDate)
  }

  return formatLongDate(labelDate)
}

function _pageTitle(date) {
  const titleDate = formatDateMonthYear(date)

  return `Water abstracted ${titleDate}`
}

module.exports = {
  go
}
