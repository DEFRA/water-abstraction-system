'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
const SchemaExportService = require('../../../../app/services/jobs/export/schema-export.service.js')

// Thing under test
const ExportService = require('../../../../app/services/jobs/export/export.service.js')

describe('Export Service', () => {
  let SchemaExportServiceStub
  let notifierStub

  beforeEach(async () => {
    SchemaExportServiceStub = Sinon.stub(SchemaExportService, 'go').resolves()
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  it('calls the SchemaExportService with the different schema names', async () => {
    const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

    await ExportService()

    const allArgs = SchemaExportServiceStub.getCalls().flatMap((call) => {
      return call.args
    })

    expect(allArgs).toEqual(schemaNames)
  })

  it('logs the time taken to export the db', async () => {
    await ExportService()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).toEqual('DB export complete')
    expect(args[1].timeTakenMs).toBeDefined()
  })
})
