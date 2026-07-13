/**
 * Exports an entire db schema and cleans up the files after upload
 * @module SchemaExportService
 */

import os from 'node:os'
import path from 'node:path'

import CompressSchemaFolderService from './compress-schema-folder.service.js'
import DeleteFilesService from './delete-files.service.js'
import ExportTableService from './export-table.service.js'
import FetchTableNamesService from './fetch-table-names.service.js'
import SendToS3BucketService from './send-to-s3-bucket.service.js'

/**
 * Exports the specific schema by fetching table names, exporting each table to a schema folder converting the folder
 * into a compressed tarball file and uploading this to the S3 bucket. Finally deleting the schema folder and the
 * schema.tgz file
 *
 * @param {string} schemaName - The name of the database schema to export
 */
export default async function schemaExport(schemaName) {
  const schemaFolderPath = _folderToUpload(schemaName)
  let compressedSchemaPath

  try {
    const tableNames = await FetchTableNamesService(schemaName)

    for (const tableName of tableNames) {
      await ExportTableService(tableName, schemaFolderPath, schemaName)
    }

    compressedSchemaPath = await CompressSchemaFolderService(schemaFolderPath)
    await SendToS3BucketService(compressedSchemaPath)
  } catch (error) {
    globalThis.GlobalNotifier.omfg(`Error: Failed to export schema ${schemaName}`, null, error)
  } finally {
    await DeleteFilesService(schemaFolderPath)
    await DeleteFilesService(compressedSchemaPath)
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
