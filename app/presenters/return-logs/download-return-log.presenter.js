'use strict'

/**
 * Formats return log data ready for presenting in the csv file
 * @module DownloadReturnLogPresenter
 */

const { formatDateObjectToISO } = require('../../lib/dates.lib.js')
const { transformArrayToCSVRow } = require('../../lib/transform-to-csv.lib.js')

const HEADERS = ['end date', 'reading', 'volume']

/**
 * Formats return log data ready for presenting in the csv file
 *
 * @param {module:ReturnLogModel} returnLog - The return log and associated submission data
 *
 * @returns {object} the data needed for the csv download
 */
function go(returnLog) {
  const { returnSubmissions } = returnLog

  const selectedReturnSubmission = returnSubmissions[0]

  const csvData = _csvData(selectedReturnSubmission)
  const filename = _fileName(returnLog)

  return {
    data: [HEADERS + '\n', ...csvData].join(''),
    filename
  }
}

function _fileName(returnLog) {
  const { returnReference, startDate, endDate, returnSubmissions } = returnLog
  const version = returnSubmissions[0].version

  return `${returnReference}_${formatDateObjectToISO(startDate)}_${formatDateObjectToISO(endDate)}_v${version}.csv`
}

function _csvData(selectedReturnSubmission) {
  const displayReadings = selectedReturnSubmission?.$method() !== 'abstractionVolumes'

  const { returnSubmissionLines } = selectedReturnSubmission

  return returnSubmissionLines.map((returnSubmissionLine) => {
    const reading = displayReadings ? returnSubmissionLine.reading : ''

    const row = [returnSubmissionLine.endDate, reading, returnSubmissionLine.quantity]

    return transformArrayToCSVRow(row)
  })
}

module.exports = {
  go
}
