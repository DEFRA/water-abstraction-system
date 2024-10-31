'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const SchemaExportService = require('../../../../app/services/jobs/export/schema-export.service.js')

// Thing under test
const ExportService = require('../../../../app/services/jobs/export/export.service.js')

describe('Export Service', () => {
  let SchemaExportServiceStub
  let notifierStub

  beforeEach(async () => {
    SchemaExportServiceStub = Sinon.stub(SchemaExportService, 'go').resolves()
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('calls the SchemaExportService with the different schema names', async () => {
    const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

    await ExportService.go()

    const allArgs = SchemaExportServiceStub.getCalls().flatMap((call) => {
      return call.args
    })

    expect(allArgs).to.equal(schemaNames)
  })

  it('logs the time taken to export the db', async () => {
    await ExportService.go()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).to.equal('DB export complete')
    expect(args[1].timeTakenMs).to.exist()
  })
})
