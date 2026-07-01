'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const CleanEmptyBillRunsService = require('../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js')
const CleanEmptyVoidReturnLogsService = require('../../../../app/services/jobs/clean/clean-empty-void-return-logs.service.js')
const CleanExpiredSessionsService = require('../../../../app/services/jobs/clean/clean-expired-sessions.service.js')
const CleanIncompleteCompanyContactsService = require('../../../../app/services/jobs/clean/clean-incomplete-company-contacts.service.js')
const CleanOrphanedContactsService = require('../../../../app/services/jobs/clean/clean-orphaned-contacts.service.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')

// Thing under test
const ProcessCleanService = require('../../../../app/services/jobs/clean/process-clean.service.js')

describe('Jobs - Clean - Process Clean service', () => {
  const emptyBillRunsCount = 3
  const emptyVoidReturnLogsCount = 4
  const expiredSessionsCount = 5
  const incompleteCompanyContactsCount = 6
  const orphanedContactsCount = 7

  let cleanEmptyBillRunsStub
  let cleanEmptyVoidReturnLogsStub
  let cleanExpiredSessionsStub
  let cleanIncompleteCompanyContactsStub
  let cleanOrphanedContactsStub
  let notifierStub

  beforeEach(async () => {
    // We stub these services to always runs successfully
    cleanEmptyVoidReturnLogsStub = Sinon.stub(CleanEmptyVoidReturnLogsService, 'go').resolves(emptyVoidReturnLogsCount)
    cleanExpiredSessionsStub = Sinon.stub(CleanExpiredSessionsService, 'go').resolves(expiredSessionsCount)
    cleanIncompleteCompanyContactsStub = Sinon.stub(CleanIncompleteCompanyContactsService, 'go').resolves(
      incompleteCompanyContactsCount
    )
    cleanOrphanedContactsStub = Sinon.stub(CleanOrphanedContactsService, 'go').resolves(orphanedContactsCount)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('when all clean tasks succeed', () => {
    beforeEach(() => {
      // For these tests we have the first task complete successfully
      cleanEmptyBillRunsStub = Sinon.stub(CleanEmptyBillRunsService, 'go').resolves(emptyBillRunsCount)
    })

    it('cleans expired sessions', async () => {
      await ProcessCleanService.go()

      expect(cleanEmptyBillRunsStub.called).toBe(true)
      expect(cleanEmptyVoidReturnLogsStub.called).toBe(true)
      expect(cleanExpiredSessionsStub.called).toBe(true)
      expect(cleanIncompleteCompanyContactsStub.called).toBe(true)
      expect(cleanOrphanedContactsStub.called).toBe(true)
    })

    it('logs the time taken in milliseconds and seconds, plus the count of rows deleted', async () => {
      await ProcessCleanService.go()

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Clean job complete')).toBe(true)
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.counts).toEqual({
        emptyBillRuns: emptyBillRunsCount,
        emptyVoidReturnLogs: emptyVoidReturnLogsCount,
        expiredSessions: expiredSessionsCount,
        incompleteCompanyContacts: incompleteCompanyContactsCount,
        orphanedContacts: orphanedContactsCount
      })
    })
  })

  // NOTE: The clean tasks are written to handle any errors, so we are not expecting that ProcessCleanService will ever
  // catch one. But as a safety net in case we make a change that does lead to something getting through, it has a
  // try/catch. Hence, we have tests to confirm it is doing what we expect.
  describe('when a clean task errors', () => {
    beforeEach(() => {
      Sinon.stub(CleanEmptyBillRunsService, 'go').rejects()
    })

    it('does not throw an error', async () => {
      await ProcessCleanService.go()
    })

    it('logs the error', async () => {
      await ProcessCleanService.go()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).toBe(true)
      expect(errorLogArgs[1]).toEqual({})
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })
  })
})
