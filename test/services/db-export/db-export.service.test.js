'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const SchemaExportService = require('../../../app/services/db-export/schema-export.service.js')

// Thing under test
const DbExportService = require('../../../app/services/db-export/db-export.service.js')

describe('Db Export Service', () => {
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

    await DbExportService.go()

    const allArgs = SchemaExportServiceStub.getCalls().flatMap((call) => {
      return call.args
    })

    expect(allArgs).to.equal(schemaNames)
  })

  it('logs the time taken to export the db', async () => {
    await DbExportService.go()

    const logMessage = notifierStub.omg.firstCall.args[0]

    expect(logMessage).to.startWith('Time taken to export the db: ')
  })
})
