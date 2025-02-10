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
 * @param {number} monthIndex - The zero-indexed month to view
 *
 * @returns {object} page data needed by the view template
 */
function go(returnSubmission, monthIndex) {
  const { returnSubmissionLines } = returnSubmission

  const requestedMonth = _determineRequestedMonth(returnSubmissionLines[0], monthIndex)
  const requestedMonthLines = returnSubmissionLines.filter((line) => line.startDate.getMonth() === requestedMonth)

  return {
    pageTitle: _formatPageTitle(returnSubmissionLines[0].startDate),
    returnReference: returnSubmission.returnLog.returnReference,
    tableData: _tableData(requestedMonthLines)
  }
}

function _determineRequestedMonth(firstLine, monthIndex) {
  const firstMonth = firstLine.startDate.getMonth()

  return firstMonth + monthIndex
}

function _formatPageTitle(date) {
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
