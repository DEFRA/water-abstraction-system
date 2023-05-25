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
const FetchTableService = require('../../../app/services/db-export/fetch-table.service.js')

// Thing under test
const TableExportService = require('../../../app/services/db-export/table-export.service.js')

describe('Table Export service', () => {
  let convertToCSVServiceStub
  let compressFilesServiceStub
  let deleteFileServiceStub
  let exportDataFilesServiceStub
  let fetchTableServiceStub

  beforeEach(async () => {
    fetchTableServiceStub = Sinon.stub(FetchTableService, 'go').resolves({ headers: [], rows: [] })
    convertToCSVServiceStub = Sinon.stub(ConvertToCSVService, 'go').resolves('csvData')
    exportDataFilesServiceStub = Sinon.stub(ExportDataFilesService, 'go').resolves('filePath')
    compressFilesServiceStub = Sinon.stub(CompressFilesService, 'go').resolves('compressedFilePath')
    deleteFileServiceStub = Sinon.stub(DeleteFileService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('runs the db export services', async () => {
    await TableExportService.go()

    expect(convertToCSVServiceStub.called).to.be.true()
    expect(compressFilesServiceStub.called).to.be.true()
    expect(deleteFileServiceStub.called).to.be.true()
    expect(exportDataFilesServiceStub.called).to.be.true()
    expect(fetchTableServiceStub.called).to.be.true()
  })
})
