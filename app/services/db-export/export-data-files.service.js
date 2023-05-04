'use strict'

/**
 * Export converted data to a temporary file
 * @module ExportDataFilesService
*/

const path = require('path')

const fs = require('fs').promises
const os = require('os')

/**
 * Writes the converted data to a csv file
 *
 * @param {String} tableConvertedToCsv The converted data to be written to the csv file
 * @param {String} tableName The name of the table
 *
 * @returns {Boolean} True if the file is written successfully and false if not
 */
async function go (tableConvertedToCsv, tableName) {
  const filePath = _filenameWithPath(tableName)

  try {
    await fs.writeFile(filePath, tableConvertedToCsv)
    global.GlobalNotifier.omg(`${tableName} exported successfully`)

    return filePath
  } catch (error) {
    global.GlobalNotifier.omfg(`${tableName} Export request errored`, error)

    return false
  }
}

/**
 * Returns a file path by joining the temp directory path with the given file name
 *
 * @param {String} tableName The name the of the table
 *
 * @returns {String} The full file path
 */
function _filenameWithPath (tableName) {
  const temporaryFilePath = os.tmpdir()

  return path.normalize(
    path.format({
      dir: temporaryFilePath,
      name: `${tableName}.csv`
    })
  )
}

module.exports = {
  go
}
