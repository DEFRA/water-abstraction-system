'use strict'

const fs = require('fs').promises

/**
 * @module ExportDataFilesService
*/

/**
 * Asynchronously converts the provided data to CSV format using the ConvertToCsvService,
 * and writes it to a file.
 * @param {Object} data - The data to be converted to CSV and written to the file.
 * @returns {Promise} - A promise that resolves with the result of the file write operation.
 */
async function go (data) {
  try {
    await fs.writeFile('./app/services/db-export/Billing Charge Categories Table Export.csv', data)
    console.log('File Written Successfully')
    return true
  } catch (error) {
    console.log('Error!', error)
    return false
  }
}

module.exports = {
  go
}
