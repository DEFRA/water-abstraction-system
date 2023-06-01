'use strict'

/**
 * Exports an entire db schema and cleans up the files after upload
 * @module SchemaExportService
 */

const path = require('path')
const os = require('os')

const CompressSchemaFolderService = require('../db-export/compress-schema-folder.service.js')
const DeleteFileService = require('./delete-file.service.js')
const DeleteFolderService = require('./delete-folder.service.js')
const ExportTableService = require('./export-table.service.js')
const FetchTableNamesService = require('../db-export/fetch-table-names.service.js')
const SendToS3BucketService = require('../db-export/send-to-s3-bucket.service.js')

/**
 * Exports the specific schema by fetching table names, exporting each table to a schema folder
 * converting the folder into a compressed tarball file and uploading this to the S3 bucket
 * Finally deleting the schema folder and the schema.tgz file
 *
 * @param {String} schemaName The name of the database to export
 */
async function go (schemaName) {
  const schemaFolderPath = _folderToUpload(schemaName)
  let tarSchemaPath

  try {
    const tableNames = await FetchTableNamesService.go(schemaName)

    for (const tableName of tableNames) {
      await ExportTableService.go(tableName, schemaFolderPath, schemaName)
    }

    const tarSchemaPath = await CompressSchemaFolderService.go(schemaFolderPath)
    await SendToS3BucketService.go(tarSchemaPath)
  } catch (error) {
    global.GlobalNotifier.omfg(`Error: Failed to export schema ${schemaName}`, error.message)
  }

  await DeleteFolderService.go(schemaFolderPath)
  await DeleteFileService.go(tarSchemaPath)
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
