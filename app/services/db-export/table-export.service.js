'use strict'

/**
 * Exports a table from the db, converts it to CSV, compresses it and
 * uploads it to our S3 bucket
 * @module TableExportService
 */

const ConvertToCSVService = require('./convert-to-csv.service')
const CompressFilesService = require('./compress-files.service')
const DeleteFileService = require('./delete-file.service')
const ExportDataFilesService = require('./export-data-files.service')
const FetchTableService = require('./fetch-table.service.js')
const SendToS3BucketService = require('./send-to-s3-bucket.service')

async function go (tableName, schemaName) {
  const data = await FetchTableService.go(tableName, schemaName)

  const tableConvertedToCsv = ConvertToCSVService.go(data.headers, data.rows)

  const filePath = await ExportDataFilesService.go(tableConvertedToCsv, data.tableName)

  const compressedFilePath = await CompressFilesService.go(filePath)

  await SendToS3BucketService.go(compressedFilePath)

  await DeleteFileService.go(filePath)
}

module.exports = {
  go
}
