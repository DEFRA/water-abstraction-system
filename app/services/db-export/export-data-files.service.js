'use strict'

const path = require('path')

const fs = require('fs').promises

const { temporaryFilePath } = require('../../../config/server.config')

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
    console.log(_filenameWithPath('Billing Charge Categories Table Export.csv'))
    await fs.writeFile(_filenameWithPath('Billing Charge Categories Table Export.csv'), data)
    console.log('File Written Successfully')
    return true
  } catch (error) {
    console.log('Error!', error)
    return false
  }
}

function _filenameWithPath (name) {
  return path.normalize(
    path.format({
      dir: temporaryFilePath,
      name
    })
  )
}

module.exports = {
  go
}
