'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CleanEmptyBillRunsService = require('../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js')
const CleanEmptyVoidReturnLogsService = require('../../../../app/services/jobs/clean/clean-empty-void-return-logs.service.js')
const CleanExpiredSessionsService = require('../../../../app/services/jobs/clean/clean-expired-sessions.service.js')
const CleanIncompleteCompanyContactsService = require('../../../../app/services/jobs/clean/clean-incomplete-company-contacts.service.js')
const CleanOrphanedContactsService = require('../../../../app/services/jobs/clean/clean-orphaned-contacts.service.js')

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

  beforeEach(async () => {
    // We stub these services to always runs successfully
    cleanEmptyVoidReturnLogsStub = Sinon.stub(CleanEmptyVoidReturnLogsService, 'go').resolves(emptyVoidReturnLogsCount)
    cleanExpiredSessionsStub = Sinon.stub(CleanExpiredSessionsService, 'go').resolves(expiredSessionsCount)
    cleanIncompleteCompanyContactsStub = Sinon.stub(CleanIncompleteCompanyContactsService, 'go').resolves(
      incompleteCompanyContactsCount
    )
    cleanOrphanedContactsStub = Sinon.stub(CleanOrphanedContactsService, 'go').resolves(orphanedContactsCount)

    global.GlobalNotifier.resetNotifier()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when all clean tasks succeed', () => {
    beforeEach(() => {
      // For these tests we have the first task complete successfully
      cleanEmptyBillRunsStub = Sinon.stub(CleanEmptyBillRunsService, 'go').resolves(emptyBillRunsCount)
    })

    it('cleans expired sessions', async () => {
      await ProcessCleanService.go()

      expect(cleanEmptyBillRunsStub.called).to.be.true()
      expect(cleanEmptyVoidReturnLogsStub.called).to.be.true()
      expect(cleanExpiredSessionsStub.called).to.be.true()
      expect(cleanIncompleteCompanyContactsStub.called).to.be.true()
      expect(cleanOrphanedContactsStub.called).to.be.true()
    })

    it('logs the time taken in milliseconds and seconds, plus the count of rows deleted', async () => {
      await ProcessCleanService.go()

      const logDataArg = global.GlobalNotifier.omg.firstCall.args[1]

      expect(global.GlobalNotifier.omg.calledWith('Clean job complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.counts).to.equal({
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
      await expect(ProcessCleanService.go()).not.to.reject()
    })

    it('logs the error', async () => {
      await ProcessCleanService.go()

      const errorLogArgs = global.GlobalNotifier.firstCall.args

      expect(global.GlobalNotifier.calledWith('Clean job failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({})
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })
  })
})
