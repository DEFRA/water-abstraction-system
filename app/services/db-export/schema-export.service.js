'use strict'

/**
 * Exports an entire db schema and cleans up the files after upload
 * @module SchemaExportService
 */

const path = require('path')
const os = require('os')

const DeleteFolderService = require('./delete-folder.service')
const FetchTableNames = require('../db-export/fetch-table-names.service')
const TableExportService = require('../db-export/table-export.service')
const SendToS3BucketService = require('../db-export/send-to-s3-bucket.service')

async function go (schemaName) {
  const tableNames = await FetchTableNames.go(schemaName)

  const schemaFolderPath = _folderToUpload(schemaName)
  for (const tableName of tableNames) {
    await TableExportService.go(tableName, schemaFolderPath, schemaName)
  }

  await SendToS3BucketService.go(schemaFolderPath)

  await DeleteFolderService.go(schemaFolderPath)
}

function _folderToUpload (schemaName) {
  const temporaryFilePath = os.tmpdir()

  return path.join(temporaryFilePath, schemaName)
}

module.exports = {
  go
}
