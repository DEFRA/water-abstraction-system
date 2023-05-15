'use strict'

/**
 * @module DbExportService
 */

const ConvertToCSVService = require('../../services/db-export/convert-to-csv.service')
const CompressFilesService = require('../../services/db-export/compress-files.service')
const DeleteFileService = require('../../services/db-export/delete-file.service')
const ExportDataFilesService = require('../../services/db-export/export-data-files.service')
const FetchBillingChargeCategoriesService = require('../../services/db-export/fetch-billing-charge-categories.service.js')
const SendToS3BucketService = require('../../services/db-export/send-to-s3-bucket.service')

async function go () {
  const data = await FetchBillingChargeCategoriesService.go()

  const tableConvertedToCsv = ConvertToCSVService.go(data.headers, data.rows)

  const filePath = await ExportDataFilesService.go(tableConvertedToCsv, data.tableName)

  const compressedFilePath = await CompressFilesService.go(filePath)

  await SendToS3BucketService.go(compressedFilePath)

  await DeleteFileService.go(filePath)
}

module.exports = {
  go
}
