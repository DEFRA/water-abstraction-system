'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ConvertToCSVService = require('../../../../app/services/data/export/convert-to-csv.service.js')
const ExportDataFilesService = require('../../../../app/services/data/export/export-data-files.service.js')
const FetchTableService = require('../../../../app/services/data/export/fetch-table.service.js')

// Thing under test
const ExportTableService = require('../../../../app/services/data/export/export-table.service.js')

describe('Table Export service', () => {
  let convertToCSVServiceStub
  let exportDataFilesServiceStub
  let fetchTableServiceStub

  beforeEach(async () => {
    fetchTableServiceStub = Sinon.stub(FetchTableService, 'go').resolves({ headers: [], rows: [] })
    convertToCSVServiceStub = Sinon.stub(ConvertToCSVService, 'go').resolves('csvData')
    exportDataFilesServiceStub = Sinon.stub(ExportDataFilesService, 'go').resolves('filePath')
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('runs the db export services', async () => {
    await ExportTableService.go()

    expect(convertToCSVServiceStub.called).to.be.true()
    expect(exportDataFilesServiceStub.called).to.be.true()
    expect(fetchTableServiceStub.called).to.be.true()
  })
})
