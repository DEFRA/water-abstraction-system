'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchTableService = require('../../../../app/services/jobs/export/fetch-table.service.js')
const WriteTableToFileService = require('../../../../app/services/jobs/export/write-table-to-file.service.js')

// Thing under test
const ExportTableService = require('../../../../app/services/jobs/export/export-table.service.js')

describe('Table Export service', () => {
  let fetchTableServiceStub
  let writeTableToFileServiceStub

  beforeEach(async () => {
    fetchTableServiceStub = Sinon.stub(FetchTableService, 'go').resolves({ headers: [], rows: [] })
    writeTableToFileServiceStub = Sinon.stub(WriteTableToFileService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('runs the db export services', async () => {
    await ExportTableService.go()

    expect(writeTableToFileServiceStub.called).to.be.true()
    expect(fetchTableServiceStub.called).to.be.true()
  })
})
