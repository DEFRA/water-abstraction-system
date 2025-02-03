'use strict'

/**
 * Formats data for the `/notifications/setup/download` link
 * @module DownloadRecipientsPresenter
 */

const ConvertToCSVService = require('../../../services/jobs/export/convert-to-csv.service.js')

/**
 * Formats data for the `/notifications/setup/download` link.
 *
 * This function takes an array of recipient objects and transforms it into a CSV
 * string suitable for download.
 *
 * @param {object[]} recipients - An array of recipients
 *
 * @returns {string} - A CSV-formatted string that includes the recipients' data, with the first
 * row as column headers and subsequent rows corresponding to the recipient details.
 */
function go(recipients) {
  const formattedData = _transformForCsv(recipients)
  return _transformJsonToCsv(formattedData)
}

/**
 * Transforms the recipients' data into a CSV-compatible format.
 *
 * This function takes an array of recipient data and maps it into a structure
 * suitable for CSV export.
 *
 * The order of the resulting objects will determine the column order in the CSV file.
 *
 * @private
 */
function _transformForCsv(recipients) {
  return recipients.map((item) => {
    return {
      Licences: item.licence_ref
    }
  })
}

/**
 * Transforms an array of JSON objects into a CSV string.
 *
 * This function takes an array of JSON objects and transforms it into a CSV string.
 * The keys of the objects become the column headers, and the values become the rows
 * corresponding to each header. The output will be a standard CSV format with the
 * first row containing the headers.
 *
 * @private
 */
function _transformJsonToCsv(jsonArray) {
  const headers = ConvertToCSVService.go(Object.keys(jsonArray[0]))

  const rows = jsonArray.map((obj) => {
    const row = Object.values(obj)
    return ConvertToCSVService.go(row)
  })

  return [headers, ...rows].join('')
}

module.exports = {
  go
}
