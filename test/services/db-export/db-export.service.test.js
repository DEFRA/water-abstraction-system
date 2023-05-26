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

  beforeEach(async () => {
    SchemaExportServiceStub = Sinon.stub(SchemaExportService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('calls the SchemaExportService with the different schema names', async () => {
    const schemaNames = ['water', 'returns', 'crm', 'crm_v2', 'idm', 'permit']

    await DbExportService.go()

    expect(SchemaExportServiceStub.callCount).to.equal(schemaNames.length)

    for (let i = 0; i < schemaNames.length; i++) {
      const [schemaName] = SchemaExportServiceStub.getCall(i).args
      expect(schemaName).to.equal(schemaNames[i])
    }
  })
})
