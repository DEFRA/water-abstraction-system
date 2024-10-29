'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchNaldLicenceRefs = require('../../../../app/services/jobs/import/fetch-nald-licence-ref.service.js')

// Thing under test
const ImportLicence = require('../../../../app/services/jobs/import/import-licence.service.js')

describe('Import Licence Service', () => {
  let notifierStub
  let stubFetchNaldLicenceIds

  beforeEach(async () => {
    stubFetchNaldLicenceIds = Sinon.stub(FetchNaldLicenceRefs, 'go').resolves(['12/34/56'])
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('calls the fetch nald licence refs service', async () => {
    await ImportLicence.go()

    expect(stubFetchNaldLicenceIds.calledOnce).to.be.true()
  })

  it('logs the time taken to export the db', async () => {
    await ImportLicence.go()

    const args = notifierStub.omg.firstCall.args

    expect(args[0]).to.equal('Importing 1 licences from NALD')
    expect(args[1].timeTakenMs).to.exist()
  })
})
