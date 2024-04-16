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
const FetchTimeLimitedLicencesService = require('../../../../app/services/jobs/time-limited/fetch-time-limited-licences.service.js')

// Thing under test
const ProcessTimeLimitedLicencesService = require('../../../../app/services/jobs/time-limited/process-time-limited-licences.service.js')

describe('Process Time Limited Licences service', () => {
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

  describe('when there are licences with time limited charge elements', () => {
    beforeEach(() => {
      fetchResults = [
        {
          id: 'ece3a745-d7b8-451e-8434-9977fbaa3bc1',
          licenceVersionId: 'a3f0bdeb-edcb-427d-9f79-c345d19d8aa1',
          chargeVersionId: 'dbb98ce9-2cfd-4d74-94ac-c4e6e8f42442'
        },
        {
          id: 'cbd2195f-17c4-407d-b7ed-c3cd729c3dca',
          licenceVersionId: 'fa25c580-710e-48f0-8932-b2d18e391994',
          chargeVersionId: 'cc192da9-d0f4-489d-bf44-0de2544bc801'
        }
      ]

      Sinon.stub(FetchTimeLimitedLicencesService, 'go').resolves(fetchResults)
    })

    it('adds the licences to the workflow table', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const results = await WorkflowModel.query().orderBy('createdAt', 'asc')

      expect(results).to.have.length(2)

      expect(results[0].licenceId).to.equal('ece3a745-d7b8-451e-8434-9977fbaa3bc1')
      expect(results[0].licenceVersionId).to.equal('a3f0bdeb-edcb-427d-9f79-c345d19d8aa1')
      expect(results[0].status).to.equal('to_setup')
      expect(results[0].data).to.equal({
        chargeVersion: null,
        timeLimitedChargeVersionId: 'dbb98ce9-2cfd-4d74-94ac-c4e6e8f42442'
      })

      expect(results[1].licenceId).to.equal('cbd2195f-17c4-407d-b7ed-c3cd729c3dca')
      expect(results[1].licenceVersionId).to.equal('fa25c580-710e-48f0-8932-b2d18e391994')
      expect(results[1].status).to.equal('to_setup')
      expect(results[1].data).to.equal({
        chargeVersion: null,
        timeLimitedChargeVersionId: 'cc192da9-d0f4-489d-bf44-0de2544bc801'
      })
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(
        notifierStub.omg.calledWith('Time limited job complete')
      ).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
    })
  })

  describe('when there are no time limited licences', () => {
    beforeEach(() => {
      fetchResults = []

      Sinon.stub(FetchTimeLimitedLicencesService, 'go').resolves(fetchResults)
    })

    it('adds nothing to workflow', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const results = await WorkflowModel.query().orderBy('createdAt', 'asc')

      expect(results).to.be.empty()
    })

    it('logs the time taken in milliseconds and seconds', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(
        notifierStub.omg.calledWith('Time limited job complete')
      ).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.count).to.exist()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(FetchTimeLimitedLicencesService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessTimeLimitedLicencesService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Time limited job failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})
