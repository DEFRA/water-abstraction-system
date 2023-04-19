'use strict'

const fs = require('fs')

/**
 * @module ExportDataFilesService
*/

const ConvertToCSVService = require('../db-export/convert-to-csv.service')

/**
 * Asynchronously converts the provided data to CSV format using the ConvertToCsvService,
 * and writes it to a file.
 * @param {Object} data - The data to be converted to CSV and written to the file.
 * @returns {Promise} - A promise that resolves with the result of the file write operation.
 */
async function go (data) {
  const convertedToCsvData = await ConvertToCSVService.go(data)
  return fs.writeFile('./app/services/db-export/Billing Charge Categories Table Export.csv', convertedToCsvData, (err) => {
    if (err) {
      console.log('Error!', err)
    } else {
      console.log('File Written Successfully')
    }
  })
}

module.exports = {
  go
}
