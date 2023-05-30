'use strict'

/**
 * Export converted data to a temporary file
 * @module ExportDataFilesService
*/

const path = require('path')

const fs = require('fs')
const fsp = fs.promises

/**
 * Writes the converted data to a csv file
 *
 * @param {String} tableConvertedToCsv The converted data to be written to the csv file
 * @param {String} tableName The name of the table
 * @param {String} schemaFolderPath The path for the schema folder
 *
 * @returns {String} Returns the file path of the newly written file
 */
async function go (tableConvertedToCsv, tableName, schemaFolderPath) {
  const filePath = _filenameWithPath(tableName, schemaFolderPath)

  await fsp.writeFile(filePath, tableConvertedToCsv)

  return filePath
}

/**
 * Returns a file path by joining the schema folder path with the file name.
 * The schema path has already been created with the temporary directory
 *
 * @param {String} tableName The name of the table
 *
 * @returns {String} The full file path
 */
function _filenameWithPath (tableName, schemaFolderPath) {
  const schemaFolderExists = fs.existsSync(schemaFolderPath)

  if (!schemaFolderExists) {
    fs.mkdirSync(schemaFolderPath)
  }

  return path.normalize(
    path.format({
      dir: schemaFolderPath,
      name: `${tableName}.csv`
    })
  )
}

module.exports = {
  go
}
