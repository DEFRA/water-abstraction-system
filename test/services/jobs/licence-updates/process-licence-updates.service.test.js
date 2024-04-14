'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const WorkflowModel = require('../../../../app/models/workflow.model.js')

// Things we need to stub
const FetchLicenceUpdatesService = require('../../../../app/services/jobs/licence-updates/fetch-licence-updates.service.js')

// Thing under test
const ProcessLicenceUpdatesService = require('../../../../app/services/jobs/licence-updates/process-licence-updates.js')

describe('Process Licence Updates service', () => {
  let fetchResults
  let notifierStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are licence updates', () => {
    beforeEach(() => {
      fetchResults = [
        {
          id: 'ece3a745-d7b8-451e-8434-9977fbaa3bc1',
          licenceId: 'a3f0bdeb-edcb-427d-9f79-c345d19d8aa1',
          chargeVersionExists: false
        },
        {
          id: 'cbd2195f-17c4-407d-b7ed-c3cd729c3dca',
          licenceId: 'fa25c580-710e-48f0-8932-b2d18e391994',
          chargeVersionExists: true
        }
      ]

      Sinon.stub(FetchLicenceUpdatesService, 'go').resolves(fetchResults)
    })

    it('adds the updated licences to workflow', async () => {
      await ProcessLicenceUpdatesService.go()

      const results = await WorkflowModel.query().orderBy('createdAt', 'asc')

      expect(results).to.have.length(2)

      expect(results[0].licenceVersionId).to.equal(fetchResults[0].id)
      expect(results[0].licenceId).to.equal(fetchResults[0].licenceId)
      expect(results[0].status).to.equal('to_setup')
      expect(results[0].data).to.equal({ chargeVersion: null, chargeVersionExists: fetchResults[0].chargeVersionExists })

      expect(results[1].licenceVersionId).to.equal(fetchResults[1].id)
      expect(results[1].licenceId).to.equal(fetchResults[1].licenceId)
      expect(results[1].status).to.equal('to_setup')
      expect(results[1].data).to.equal({ chargeVersion: null, chargeVersionExists: fetchResults[1].chargeVersionExists })
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceUpdatesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(
        notifierStub.omg.calledWith('Licence updates job complete')
      ).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
    })
  })

  describe('when there are no licence updates', () => {
    beforeEach(() => {
      fetchResults = []

      Sinon.stub(FetchLicenceUpdatesService, 'go').resolves(fetchResults)
    })

    it('adds nothing to workflow', async () => {
      await ProcessLicenceUpdatesService.go()

      const results = await WorkflowModel.query().orderBy('createdAt', 'asc')

      expect(results).to.be.empty()
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessLicenceUpdatesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(
        notifierStub.omg.calledWith('Licence updates job complete')
      ).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceUpdatesService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessLicenceUpdatesService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Licence updates job failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})
