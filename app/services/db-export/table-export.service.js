'use strict'

/**
 * Exports a table from the db, converts it to CSV and compresses it. The CSV file
 * is then deleted whilst the compressed file remains, ready to be sent to our S3 bucket
 *
 * @module TableExportService
 */

const ConvertToCSVService = require('./convert-to-csv.service')
const CompressFilesService = require('./compress-files.service')
const ExportDataFilesService = require('./export-data-files.service')
const DeleteFileService = require('./delete-file.service')
const FetchTableService = require('./fetch-table.service.js')

async function go (tableName, schemaFolderPath, schemaName) {
  const data = await FetchTableService.go(tableName, schemaName)

  const tableConvertedToCsv = ConvertToCSVService.go(data.headers, data.rows)

  const filePath = await ExportDataFilesService.go(tableConvertedToCsv, data.tableName, schemaFolderPath)

  await CompressFilesService.go(filePath)

  await DeleteFileService.go(filePath)
}

module.exports = {
  go
}
