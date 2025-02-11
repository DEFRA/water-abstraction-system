'use strict'

/**
 * Formats return submission data ready for presenting in the view return submission page
 * @module ViewReturnSubmissionPresenter
 */

const { formatLongDate, formatNumber } = require('../base.presenter.js')

/**
 * Formats return submission data ready for presenting in the view return log page
 *
 * @param {module:ReturnSubmissionModel} returnSubmission - The return submission
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {object} page data needed by the view template
 */
function go(returnSubmission, yearMonth) {
  const { returnSubmissionLines } = returnSubmission

  const [requestedYear, requestedMonth] = _determineRequestedYearAndMonth(yearMonth)
  const requestedMonthLines = returnSubmissionLines.filter(
    (line) => line.startDate.getFullYear() === requestedYear && line.startDate.getMonth() === requestedMonth
  )

  return {
    rawData: JSON.stringify(returnSubmission, null, 2),
    backLink: _backLink(returnSubmission),
    pageTitle: _pageTitle(requestedMonthLines[0].startDate),
    returnReference: returnSubmission.returnLog.returnReference,
    tableData: _tableData(requestedMonthLines)
  }
}

function _backLink(returnSubmission) {
  return `/system/return-logs?id=${returnSubmission.returnLogId}`
}

function _determineRequestedYearAndMonth(yearMonth) {
  // Splitting a string like `2014-0` by the dash gives us an array of strings ['2014', '0']. We chain `.map(Number)` to
  // then create a new array, applying the Number() function to each one. The result is an array of numbers [2014, 0].
  return yearMonth.split('-').map(Number)
}

function _pageTitle(date) {
  const titleDate = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })

  return `Water abstracted ${titleDate}`
}

function _tableData(lines) {
  const headers = [{ text: 'Day' }, { text: 'Cubic metres', format: 'numeric' }]

  const rows = lines.map((line) => {
    return {
      date: formatLongDate(line.startDate),
      quantity: formatNumber(line.quantity)
    }
  })

  return {
    headers,
    rows,
    total: _total(lines)
  }
}

function _total(lines) {
  const total = lines.reduce((acc, line) => {
    const quantity = line.quantity ?? 0

    return acc + quantity
  }, 0)

  return formatNumber(total)
}

module.exports = {
  go
}
