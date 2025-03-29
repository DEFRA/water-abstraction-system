'use strict'

/**
 * Formats return submission data ready for presenting in the view return submission page
 * @module ViewReturnSubmissionPresenter
 */

const { formatLongDate, formatNumber, formatQuantity, sentenceCase } = require('../base.presenter.js')

const { returnUnits, unitNames } = require('../../lib/static-lookups.lib.js')

/**
 * Formats return submission data ready for presenting in the view return submission page
 *
 * @param {module:ReturnSubmissionModel} returnSubmission - The return submission
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {object} page data needed by the view template
 */
function go(returnSubmission, yearMonth) {
  const { returnSubmissionLines } = returnSubmission

  const [requestedYear, requestedMonth] = _determineRequestedYearAndMonth(yearMonth)
  const requestedMonthLines = returnSubmissionLines.filter((line) => {
    return line.endDate.getFullYear() === requestedYear && line.endDate.getMonth() === requestedMonth
  })

  const method = returnSubmission.$method()
  const units = returnSubmission.$units()

  return {
    backLink: _backLink(returnSubmission),
    backLinkText: _backLinkText(returnSubmission),
    displayReadings: method !== 'abstractionVolumes',
    displayUnits: units !== unitNames.CUBIC_METRES,
    pageTitle: _pageTitle(requestedMonthLines[0].endDate),
    returnReference: returnSubmission.returnLog.returnReference,
    tableData: _tableData(requestedMonthLines, units, method, returnSubmission.returnLog.returnsFrequency)
  }
}

function _backLink(returnSubmission) {
  if (returnSubmission.current) {
    return `/system/return-logs?id=${returnSubmission.returnLogId}`
  }

  return `/system/return-logs?id=${returnSubmission.returnLogId}&version=${returnSubmission.version}`
}

function _backLinkText(returnSubmission) {
  if (returnSubmission.current) {
    return `Go back to return ${returnSubmission.returnLog.returnReference}`
  }

  return `Go back to return ${returnSubmission.returnLog.returnReference} version ${returnSubmission.version}`
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

function _tableData(lines, units, method, frequency) {
  const headers = _generateTableHeaders(units, method, frequency)
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
    const { endDate, quantity, reading, userUnit } = line

    const rowData = {
      cubicMetresQuantity: formatNumber(quantity),
      date: formatLongDate(endDate),
      reading,
      unitQuantity: formatQuantity(userUnit, quantity)
    }

    return rowData
  })
}

function _generateTableHeaders(units, method, frequency) {
  const headers = []

  if (frequency === 'week') {
    headers.push({ text: 'Week ending' })
  } else {
    headers.push({ text: 'Day' })
  }

  if (method !== 'abstractionVolumes') {
    headers.push({ text: 'Reading', format: 'numeric' })
  }

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
    cubicMetresTotal: formatNumber(totalQuantity),
    unitTotal: formatQuantity(units, totalQuantity)
  }
}

module.exports = {
  go
}
