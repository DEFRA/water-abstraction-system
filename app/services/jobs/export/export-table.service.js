'use strict'

/**
 * Exports a individual table to CSV format
 * @module ExportTableService
 */

const FetchTableService = require('./fetch-table.service.js')
const WriteTableToFileService = require('./write-table-to-file.service.js')

/**
 * Exports a database table
 *
 * Exports the specific database table by fetching the database query (input stream) and passing it to a write stream
 * service which transforms the data to a CSV format
 *
 * @param {string} tableName - The name of the database table to export
 * @param {string} schemaFolderPath - The folder path where the schema files are stored
 * @param {string} schemaName - The name of the database schema
 */
async function go (tableName, schemaFolderPath, schemaName) {
  const data = await FetchTableService.go(tableName, schemaName)

  await WriteTableToFileService.go(data.headers, data.rows, schemaFolderPath, tableName)
}

module.exports = {
  go
}
