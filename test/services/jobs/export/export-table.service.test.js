'use strict'

// Test framework dependencies
const Sinon = require('sinon')

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
    await ExportTableService()

    expect(writeTableToFileServiceStub.called).toBe(true)
    expect(fetchTableServiceStub.called).toBe(true)
  })
})
