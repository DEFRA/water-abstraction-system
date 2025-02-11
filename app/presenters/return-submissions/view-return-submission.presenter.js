'use strict'

/**
 * Formats return submission data ready for presenting in the view return submission page
 * @module ViewReturnSubmissionPresenter
 */

const { formatLongDate, formatNumber, formatQuantity, sentenceCase } = require('../base.presenter.js')

const { returnUnits, unitNames } = require('../../lib/static-lookups.lib.js')

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

  const units = returnSubmission.$units()

  return {
    rawData: JSON.stringify(returnSubmission, null, 2),
    backLink: _backLink(returnSubmission),
    displayUnits: units !== unitNames.CUBIC_METRES,
    pageTitle: _pageTitle(requestedMonthLines[0].endDate),
    returnReference: returnSubmission.returnLog.returnReference,
    tableData: _tableData(requestedMonthLines, units)
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

function _tableData(lines, units) {
  const headers = _generateTableHeaders(units)
  const rows = _generateTableRows(lines)
  const { cubicMetresTotal, unitTotal } = _total(lines, units)

  return {
    cubicMetresTotal,
    headers,
    rows,
    unitTotal
  }
}

function _generateTableRows(lines) {
  return lines.map((line) => {
    const { endDate, quantity, userUnit } = line

    const rowData = {
      cubicMetresQuantity: formatQuantity(userUnit, quantity),
      date: formatLongDate(endDate),
      unitQuantity: formatNumber(quantity)
    }

    return rowData
  })
}

function _generateTableHeaders(units) {
  const headers = [{ text: 'Day' }]

  if (units !== unitNames.CUBIC_METRES) {
    headers.push({ text: sentenceCase(returnUnits[units].label), format: 'numeric' })
  }

  headers.push({ text: 'Cubic metres', format: 'numeric' })

  return headers
}

function _total(lines, units) {
  const totalQuantity = lines.reduce((acc, line) => {
    const quantity = line.quantity ?? 0

    return acc + quantity
  }, 0)

  return {
    cubicMetresTotal: formatQuantity(units, totalQuantity),
    unitTotal: formatNumber(totalQuantity)
  }
}

module.exports = {
  go
}
