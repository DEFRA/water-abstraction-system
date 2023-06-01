'use strict'

/**
 * Exports a table from the db, converts it to CSV format and saves it to a file
 *
 * @module ExportTableService
 */

const ConvertToCSVService = require('./convert-to-csv.service.js')
const ExportDataFilesService = require('./export-data-files.service.js')
const FetchTableService = require('./fetch-table.service.js')

/**
 * Exports the specific database table by fetching its data, converting it to CSV format,
 * and exporting the data files to the provided schema folder path
 *
 * @param {String} tableName The name of the database table to export
 * @param {String} schemaFolderPath The folder path where the schema files are stored
 * @param {String} schemaName The name of the database schema
 */
async function go (tableName, schemaFolderPath, schemaName) {
  const data = await FetchTableService.go(tableName, schemaName)

  const tableConvertedToCsv = ConvertToCSVService.go(data.headers, data.rows)

  await ExportDataFilesService.go(tableConvertedToCsv, data.tableName, schemaFolderPath)
}

module.exports = {
  go
}
