'use strict'

/**
 * Exports an entire db schema and cleans up the files after upload
 * @module SchemaExportService
 */

const path = require('path')
const os = require('os')

const DeleteFolderService = require('./delete-folder.service.js')
const FetchTableNames = require('../db-export/fetch-table-names.service.js')
const SendToS3BucketService = require('../db-export/send-to-s3-bucket.service.js')
const ExportCompressedTableService = require('./export-compressed-table.service.js')

/**
 * Exports the specific schema by fetching table names, exporting each table,
 * and uploading the schema folder to an S3 bucket
 *
 * @param {String} schemaName The name of the database to export
 */
async function go (schemaName) {
  const tableNames = await FetchTableNames.go(schemaName)

  const schemaFolderPath = _folderToUpload(schemaName)
  for (const tableName of tableNames) {
    await ExportCompressedTableService.go(tableName, schemaFolderPath, schemaName)
  }

  await SendToS3BucketService.go(schemaFolderPath)

  await DeleteFolderService.go(schemaFolderPath)
}

/**
 * Generates the folder path where the schema will be temporarily stored for upload
 *
 * @param {String} schemaName The name of the database schema
 *
 * @returns {String} The folder path where the schema will be temporarily stored
 */
function _folderToUpload (schemaName) {
  const temporaryFilePath = os.tmpdir()

  return path.join(temporaryFilePath, schemaName)
}

module.exports = {
  go
}
