'use strict'

/**
 * Exports a individual table to CSV format
 * @module ExportTableService
 */

const FetchTableService = require('./fetch-table.service.js')
const WriteStreamToFileService = require('./write-stream-to-file.service.js')

/**
 * Exports a database table
 *
 * Exports the specific database table by fetching the database query (input stream) and passing it to a write stream
 * service which transforms the data to a CSV format
 *
 * @param {String} tableName The name of the database table to export
 * @param {String} schemaFolderPath The folder path where the schema files are stored
 * @param {String} schemaName The name of the database schema
 */
async function go (tableName, schemaFolderPath, schemaName) {
  const data = await FetchTableService.go(tableName, schemaName)

  await WriteStreamToFileService.go(data, schemaFolderPath, tableName)
}

module.exports = {
  go
}
