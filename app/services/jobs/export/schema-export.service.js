'use strict'

/**
 * Exports an entire db schema and cleans up the files after upload
 * @module SchemaExportService
 */

const os = require('os')
const path = require('path')

const CompressSchemaFolderService = require('./compress-schema-folder.service.js')
const DeleteFilesService = require('./delete-files.service.js')
const ExportTableService = require('./export-table.service.js')
const FetchTableNamesService = require('./fetch-table-names.service.js')
const SendToS3BucketService = require('./send-to-s3-bucket.service.js')

/**
 * Exports the specific schema by fetching table names, exporting each table to a schema folder converting the folder
 * into a compressed tarball file and uploading this to the S3 bucket. Finally deleting the schema folder and the
 * schema.tgz file
 *
 * @param {string} schemaName - The name of the database schema to export
 */
async function go(schemaName) {
  const schemaFolderPath = _folderToUpload(schemaName)
  let compressedSchemaPath

  try {
    const tableNames = await FetchTableNamesService.go(schemaName)

    for (const tableName of tableNames) {
      await ExportTableService.go(tableName, schemaFolderPath, schemaName)
    }

    compressedSchemaPath = await CompressSchemaFolderService.go(schemaFolderPath)
    await SendToS3BucketService.go(compressedSchemaPath)
  } catch (error) {
    global.GlobalNotifier.omfg(`Error: Failed to export schema ${schemaName}`, null, error)
  } finally {
    await DeleteFilesService.go(schemaFolderPath)
    await DeleteFilesService.go(compressedSchemaPath)
  }
}

/**
 * Generates the folder path where the schema will be temporarily stored for upload
 *
 * @param {string} schemaName - The name of the database schema
 *
 * @returns {string} The folder path where the schema will be temporarily stored
 *
 * @private
 */
function _folderToUpload(schemaName) {
  const temporaryFilePath = os.tmpdir()

  return path.join(temporaryFilePath, schemaName)
}

module.exports = {
  go
}
