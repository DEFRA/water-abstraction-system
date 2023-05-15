'use strict'

/**
 * Controller for /data endpoints
 * @module DataController
 */

const Boom = require('@hapi/boom')

const ConvertToCSVService = require('../../services/db-export/convert-to-csv.service')
const CompressFilesService = require('../../services/db-export/compress-files.service')
const DeleteFileService = require('../../services/db-export/delete-file.service')
const ExportDataFilesService = require('../../services/db-export/export-data-files.service')
const FetchBillingChargeCategoriesService = require('../../services/db-export/fetch-billing-charge-categories.service.js')
const SendToS3BucketService = require('../../services/db-export/send-to-s3-bucket.service')
const TearDownService = require('../../services/data/tear-down/tear-down.service.js')

async function tearDown (_request, h) {
  try {
    await TearDownService.go()

    return h.response().code(204)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

/**
 * Triggers export of all relevant tables to CSV and then uploads them to S3
 */
async function dbExport (_request, _h) {
  const data = await FetchBillingChargeCategoriesService.go()
  const tableConvertedToCsv = ConvertToCSVService.go(data.headers, data.rows)
  const filePath = await ExportDataFilesService.go(tableConvertedToCsv, data.tableName)
  const compressedFilePath = await CompressFilesService.go(filePath)
  await SendToS3BucketService.go(compressedFilePath)
  await DeleteFileService.go(filePath)

  return { status: 'successful' }
}

module.exports = {
  tearDown,
  dbExport
}
