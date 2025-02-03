'use strict'

/**
 * Formats data for the `/notifications/setup/download` link
 * @module DownloadRecipientsPresenter
 */

/**
 * Formats data for the `/notifications/setup/download` link
 *
 * Will take an array of recipients and convert it into a csv.
 *
 * @param {object[]} recipients - List of recipient objects, each containing recipient details like email or name.
 *
 * @returns {string} - The data to a csv string
 */
function go(recipients) {
  const formattedData = _formatData(recipients)
  return _jsonToCSV(formattedData)
}

function _formatData(data) {
  return data.map((item) => {
    return {
      Licences: item.licence_ref
    }
  })
}

function _jsonToCSV(jsonArray) {
  // Get the headers from the keys of the first object
  const headers = Object.keys(jsonArray[0])

  // Map each object in the array to a CSV row
  const rows = jsonArray.map((obj) => headers.map((header) => `"${obj[header]}"`).join(','))

  // Join headers and rows to form the CSV string
  return [headers.join(','), ...rows].join('\n')
}

module.exports = {
  go
}
