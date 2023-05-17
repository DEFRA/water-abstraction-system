'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ConvertToCSVService = require('../../../app/services/db-export/convert-to-csv.service.js')
const CompressFilesService = require('../../../app/services/db-export/compress-files.service.js')
const DeleteFileService = require('../../../app/services/db-export/delete-file.service.js')
const ExportDataFilesService = require('../../../app/services/db-export/export-data-files.service.js')
const FetchBillingChargeCategoriesService = require('../../../app/services/db-export/fetch-billing-charge-categories.service.js')
const SendToS3BucketService = require('../../../app/services/db-export/send-to-s3-bucket.service.js')

// Thing under test
const DbExportService = require('../../../app/services/db-export/db-export.service.js')

describe('Db Export service', () => {
  let notifierStub
  let convertToCSVServiceStub
  let compressFilesServiceStub
  let deleteFileServiceStub
  let exportDataFilesServiceStub
  let fetchBillingChargeCategoriesServiceStub
  let sendToS3BucketServiceStub

  beforeEach(async () => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    fetchBillingChargeCategoriesServiceStub = Sinon.stub(FetchBillingChargeCategoriesService, 'go').resolves({ headers: [], rows: [] })
    convertToCSVServiceStub = Sinon.stub(ConvertToCSVService, 'go').resolves('csvData')
    exportDataFilesServiceStub = Sinon.stub(ExportDataFilesService, 'go').resolves('filePath')
    compressFilesServiceStub = Sinon.stub(CompressFilesService, 'go').resolves('compressedFilePath')
    sendToS3BucketServiceStub = Sinon.stub(SendToS3BucketService, 'go').resolves()
    deleteFileServiceStub = Sinon.stub(DeleteFileService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('runs the db export services', async () => {
    await DbExportService.go()

    expect(convertToCSVServiceStub.called).to.be.true()
    expect(compressFilesServiceStub.called).to.be.true()
    expect(deleteFileServiceStub.called).to.be.true()
    expect(exportDataFilesServiceStub.called).to.be.true()
    expect(fetchBillingChargeCategoriesServiceStub.called).to.be.true()
    expect(sendToS3BucketServiceStub.called).to.be.true()
  })
})
