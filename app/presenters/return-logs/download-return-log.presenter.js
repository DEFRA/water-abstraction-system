'use strict'

/**
 * Formats return log data ready for presenting in the csv file
 * @module DownloadReturnLogPresenter
 */

const { formatDateObjectToISO } = require('../../lib/dates.lib.js')
const { transformArrayToCSVRow } = require('../../lib/transform-to-csv.lib.js')

const HEADERS = ['start date', 'reading', 'volume']

/**
 * Formats return log data ready for presenting in the csv file
 *
 * @param {module:ReturnLogModel} returnLog - The return log and associated submission data
 *
 * @returns {object} the data needed for the csv download
 */
function go(returnLog) {
  const { returnSubmissions } = returnLog

  const selectedReturnSubmission = _selectedReturnSubmission(returnSubmissions)

  const csvData = _transformToCsv(selectedReturnSubmission)
  const filename = _formatFileName(returnLog)

  return {
    data: [HEADERS + '\n', ...csvData].join(''),
    filename
  }
}

function _formatFileName(returnLog) {
  const { returnReference, startDate, endDate, returnSubmissions } = returnLog
  const version = returnSubmissions[0].version

  return `${returnReference}_${formatDateObjectToISO(startDate)}_${formatDateObjectToISO(endDate)}_v${version}.csv`
}

function _transformToCsv(selectedReturnSubmission) {
  const displayReadings = selectedReturnSubmission?.$method() !== 'abstractionVolumes'

  const { returnSubmissionLines } = selectedReturnSubmission

  return returnSubmissionLines.map((returnSubmissionLine) => {
    const reading = displayReadings ? returnSubmissionLine.reading : ''

    const row = [returnSubmissionLine.startDate, reading, returnSubmissionLine.quantity]

    return transformArrayToCSVRow(row)
  })
}

function _selectedReturnSubmission(returnSubmissions) {
  if (!returnSubmissions) {
    return null
  }

  return returnSubmissions[0]
}
module.exports = {
  go
}
