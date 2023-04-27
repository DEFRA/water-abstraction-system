'use strict'

/**
 * Export converted data to a temporary file
 * @module ExportDataFilesService
*/

const path = require('path')

const fs = require('fs').promises
const os = require('os')

/**
 * Converts the provided data to CSV format using the ConvertToCsvService and writes it to a file
 *
 * @param {Object} data The data to be converted to CSV and written to the file
 *
 * @returns {Boolean} True if the file is written successfully and false if not
 */
async function go (data) {
  try {
    await fs.writeFile(_filenameWithPath('Billing Charge Categories Table Export.csv'), data)
    global.GlobalNotifier.omg('Billing Charge Categories Table exported successfully')

    return true
  } catch (error) {
    global.GlobalNotifier.omfg('Billing Charge Categories Table Export request errored', error)

    return false
  }
}

/**
 * Returns a file path by joining the temp directory path with the given file name
 *
 * @param {String} name The name the file will be saved under
 *
 * @returns {String} The file path to save the file under
 */
function _filenameWithPath (name) {
  const temporaryFilePath = os.tmpdir()

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
