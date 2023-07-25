'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchTableService = require('../../../../app/services/data/export/fetch-table.service.js')
const WriteStreamToFileService = require('../../../../app/services/data/export/write-stream-to-file.service.js')

// Thing under test
const ExportTableService = require('../../../../app/services/data/export/export-table.service.js')

describe('Table Export service', () => {
  let fetchTableServiceStub
  let writeStreamToFileServiceStub

  beforeEach(async () => {
    fetchTableServiceStub = Sinon.stub(FetchTableService, 'go').resolves({ headers: [], rows: [] })
    writeStreamToFileServiceStub = Sinon.stub(WriteStreamToFileService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('runs the db export services', async () => {
    await ExportTableService.go()

    expect(writeStreamToFileServiceStub.called).to.be.true()
    expect(fetchTableServiceStub.called).to.be.true()
  })
})
