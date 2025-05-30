'use strict'

/**
 * Formats data for the `/reporting/download` link
 * @module DownloadReturnLogSubmissionsPresenter
 */

const { daysFromPeriod, weeksFromPeriod, monthsFromPeriod } = require('../../lib/dates.lib.js')
const DetermineAbstractionPeriodService = require('../../services/bill-runs/determine-abstraction-periods.service.js')
const { transformArrayToCSVRow } = require('../../lib/transform-to-csv.lib.js')

const HEADERS = [
  'Licence Number',
  'Format ID',
  'Site Description',
  'Time Period',
  'Abstraction Date',
  'Quantity',
  'Unit'
]

/**
 * Formats data for the `/reporting/download` link
 *
 * This function takes an array of return submission objects and transforms it into a CSV string suitable for download.
 *
 * The headers are fixed and in the correct order. If a value for a row does not match the header then it will default
 * to an empty string.
 *
 * @param {object[]} returnLogSubmissions - An array of recipients
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first row as column headers
 * and subsequent rows corresponding to the recipient details.
 */
function go(returnLogSubmissions) {
  const rows = _transformToCsv(returnLogSubmissions)

  return [HEADERS + '\n', ...rows].join('')
}

function _createLines(
  endDate,
  periodStartDay,
  periodStartMonth,
  periodEndDay,
  periodEndMonth,
  returnsFrequency,
  startDate
) {
  const referencePeriod = { endDate, startDate }
  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    referencePeriod,
    periodStartDay,
    periodStartMonth,
    periodEndDay,
    periodEndMonth
  )

  let lines

  if (returnsFrequency === 'day') {
    lines = daysFromPeriod(startDate, endDate)
  }

  if (returnsFrequency === 'week') {
    lines = weeksFromPeriod(startDate, endDate)
  }

  if (returnsFrequency === 'month') {
    lines = monthsFromPeriod(startDate, endDate)
  }

  lines.forEach((line) => {
    if (_inPeriod(abstractionPeriods, line)) {
      line.quantity = 0
      line.userUnit = 'm3'
    } else {
      line.quantity = null
      line.userUnit = 'm3'
    }
  })

  return lines
}

function _inPeriod(abstractionPeriods, line) {
  return abstractionPeriods.some((abstractionPeriod) => {
    return abstractionPeriod.startDate <= line.endDate && abstractionPeriod.endDate >= line.startDate
  })
}

/**
 * Transforms the return submissions' data into a CSV-compatible format.
 *
 * The order of the properties must match the CSV header order.
 *
 * @private
 */
function _transformToCsv(returnLogSubmissions) {
  const csvRows = []

  returnLogSubmissions.forEach((returnLogSubmission) => {
    const {
      endDate,
      licenceRef,
      periodStartDay,
      periodStartMonth,
      periodEndDay,
      periodEndMonth,
      returnsFrequency,
      returnReference,
      returnSubmissions,
      siteDescription,
      startDate
    } = returnLogSubmission

    if (returnSubmissions[0].nilReturn) {
      returnSubmissions[0].returnSubmissionLines = _createLines(
        endDate,
        periodStartDay,
        periodStartMonth,
        periodEndDay,
        periodEndMonth,
        returnsFrequency,
        startDate
      )
    }

    const rows = returnSubmissions[0].returnSubmissionLines.map((returnSubmissionLines) => {
      const row = [
        licenceRef,
        returnReference,
        siteDescription,
        returnsFrequency,
        returnSubmissionLines.endDate,
        returnSubmissionLines.quantity,
        returnSubmissionLines.userUnit
      ]

      return transformArrayToCSVRow(row)
    })

    csvRows.push(rows)
  })
  return csvRows.flat()
}

module.exports = {
  go
}
