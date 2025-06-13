'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CleanEmptyVoidReturnLogsService = require('../../../../app/services/jobs/clean/clean-empty-void-return-logs.service.js')
const CleanExpiredSessionsService = require('../../../../app/services/jobs/clean/clean-expired-sessions.service.js')

// Thing under test
const ProcessCleanService = require('../../../../app/services/jobs/clean/process-clean.service.js')

describe('Jobs - Clean - Process Clean service', () => {
  const emptyVoidReturnLogsCount = 4
  const expiredSessionsCount = 5

  let cleanEmptyVoidReturnLogsStub
  let cleanExpiredSessionsStub
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when all clean tasks succeed', () => {
    beforeEach(() => {
      cleanEmptyVoidReturnLogsStub = Sinon.stub(CleanEmptyVoidReturnLogsService, 'go').resolves(
        emptyVoidReturnLogsCount
      )
      cleanExpiredSessionsStub = Sinon.stub(CleanExpiredSessionsService, 'go').resolves(expiredSessionsCount)
    })

    it('cleans expired sessions', async () => {
      await ProcessCleanService.go()

      expect(cleanEmptyVoidReturnLogsStub.called).to.be.true()
      expect(cleanExpiredSessionsStub.called).to.be.true()
    })

    it('logs the time taken in milliseconds and seconds, plus the count of rows deleted', async () => {
      await ProcessCleanService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Clean job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.counts).to.equal({
        emptyVoidReturnLogs: emptyVoidReturnLogsCount,
        expiredSessions: expiredSessionsCount
      })
    })
  })

  describe('when a clean task errors', () => {
    beforeEach(() => {
      Sinon.stub(CleanEmptyVoidReturnLogsService, 'go').rejects()
    })

    it('does not throw an error', async () => {
      await expect(ProcessCleanService.go()).not.to.reject()
    })

    it('logs the error', async () => {
      await ProcessCleanService.go()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({})
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })
  })
})
