'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicences = require('../../../../app/services/jobs/import/fetch-licences.service.js')
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licences.service.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ImportLicenceService = require('../../../../app/services/jobs/import/import-licences.service.js')

describe('Import Licence Service', () => {
  let stubFetchLicences
  let stubProcessImportLicence
  let notifierStub
  let licences

  beforeEach(async () => {
    licences = [[{ id: generateUUID(), expired_date: null, lapsed_date: null, revoked_date: null }]]

    stubFetchLicences = Sinon.stub(FetchLicences, 'go').resolves(licences)
    stubProcessImportLicence = Sinon.stub(ProcessImportLicence, 'go').resolves()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('fetches the nald licence data and starts the process to import the licences', async () => {
    await ImportLicenceService.go()

    expect(stubFetchLicences.calledOnce).to.be.true()
    expect(stubProcessImportLicence.calledWith(licences)).to.be.true()
  })

  it('logs to highlight the amount of licences being imported', async () => {
    await ImportLicenceService.go()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).to.equal('Importing 1 licences from NALD')
    expect(args[1].timeTakenMs).to.exist()
  })
})
