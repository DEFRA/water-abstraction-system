'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { returnCycle, returnRequirement } = require('../../../fixtures/return-logs.fixture.js')

// Things we need to stub
const CreateCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/create-current-return-cycle.service.js')
const CreateReturnLogsService = require('../../../../app/services/return-logs/create-return-logs.service.js')
const CheckReturnCycleService = require('../../../../app/services/return-logs/check-return-cycle.service.js')
const FetchReturnRequirementsService = require('../../../../app/services/jobs/return-logs/fetch-return-requirements.service.js')

// Thing under test
const ProcessReturnLogsService = require('../../../../app/services/jobs/return-logs/process-return-logs.service.js')

describe('Jobs - Return Logs - Process return logs service', () => {
  const cycle = 'all-year'

  let createReturnLogsStub
  let notifierStub

  beforeEach(() => {
    createReturnLogsStub = Sinon.stub(CreateReturnLogsService, 'go').resolves()
    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the requested return cycle exists', () => {
    beforeEach(() => {
      Sinon.stub(CheckReturnCycleService, 'go').resolves(returnCycle())
      Sinon.stub(CreateCurrentReturnCycleService, 'go').resolves()
    })

    describe('and there are return requirements that need return logs created', () => {
      beforeEach(() => {
        Sinon.stub(FetchReturnRequirementsService, 'go').resolves([returnRequirement()])
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService.go(cycle)

        const logDataArg = notifierStub.omg.firstCall.args[1]

        expect(createReturnLogsStub.called).to.be.true()
        expect(notifierStub.omg.calledWith('Return logs job complete')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.count).to.equal(1)
        expect(logDataArg.cycle).to.equal(cycle)
      })
    })

    describe('but there are no return requirements that need return logs created', () => {
      beforeEach(() => {
        Sinon.stub(FetchReturnRequirementsService, 'go').resolves([])
      })

      it('still logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService.go(cycle)

        const logDataArg = notifierStub.omg.firstCall.args[1]

        expect(notifierStub.omg.calledWith('Return logs job complete')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.count).to.equal(0)
        expect(logDataArg.cycle).to.equal(cycle)
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      Sinon.stub(CheckReturnCycleService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessReturnLogsService.go(cycle)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Return logs job failed')
      expect(args[1]).to.equal({ cycle })
      expect(args[2]).to.be.an.error()
    })
  })
})
