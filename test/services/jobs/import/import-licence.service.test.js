'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchNaldLicenceRefs = require('../../../../app/services/jobs/import/fetch-nald-licence-ref.service.js')
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

// Thing under test
const ImportLicence = require('../../../../app/services/jobs/import/import-licence.service.js')

describe('Import Licence Service', () => {
  let stubFetchNaldLicenceIds
  let stubProcessImportLicence
  let notifierStub

  beforeEach(async () => {
    stubFetchNaldLicenceIds = Sinon.stub(FetchNaldLicenceRefs, 'go').resolves([{ licence_ref: '12/34/56' }])
    stubProcessImportLicence = Sinon.stub(ProcessImportLicence, 'go').resolves()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('fetches the nald licence data and starts the process to import the licences', async () => {
    await ImportLicence.go()

    expect(stubFetchNaldLicenceIds.calledOnce).to.be.true()
    expect(stubProcessImportLicence.calledWith([{ licence_ref: '12/34/56' }])).to.be.true()
  })

  it('logs to highlight the amount of licences being imported', async () => {
    await ImportLicence.go()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).to.equal('Importing 1 licences from NALD')
    expect(args[1].timeTakenMs).to.exist()
  })
})
