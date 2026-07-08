// Test framework dependencies

// Things we need to stub
import * as CleanEmptyBillRunsService from '../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js'
import * as CleanEmptyVoidReturnLogsService from '../../../../app/services/jobs/clean/clean-empty-void-return-logs.service.js'
import * as CleanExpiredSessionsService from '../../../../app/services/jobs/clean/clean-expired-sessions.service.js'
import * as CleanIncompleteCompanyContactsService from '../../../../app/services/jobs/clean/clean-incomplete-company-contacts.service.js'
import * as CleanOrphanedContactsService from '../../../../app/services/jobs/clean/clean-orphaned-contacts.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import ProcessCleanService from '../../../../app/services/jobs/clean/process-clean.service.js'

describe('Jobs - Clean - Process Clean service', () => {
  const emptyBillRunsCount = 3
  const emptyVoidReturnLogsCount = 4
  const expiredSessionsCount = 5
  const incompleteCompanyContactsCount = 6
  const orphanedContactsCount = 7
  let notifierStub

  beforeEach(async () => {
    // We stub these services to always runs successfully
    vi.spyOn(CleanEmptyVoidReturnLogsService, 'default').mockResolvedValue(emptyVoidReturnLogsCount)
    vi.spyOn(CleanExpiredSessionsService, 'default').mockResolvedValue(expiredSessionsCount)
    vi.spyOn(CleanIncompleteCompanyContactsService, 'default').mockResolvedValue(incompleteCompanyContactsCount)
    vi.spyOn(CleanOrphanedContactsService, 'default').mockResolvedValue(orphanedContactsCount)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when all clean tasks succeed', () => {
    beforeEach(() => {
      // For these tests we have the first task complete successfully
      vi.spyOn(CleanEmptyBillRunsService, 'default').mockResolvedValue(emptyBillRunsCount)
    })

    it('cleans expired sessions', async () => {
      await ProcessCleanService()

      expect(CleanEmptyBillRunsService.default).toHaveBeenCalled()
      expect(CleanEmptyVoidReturnLogsService.default).toHaveBeenCalled()
      expect(CleanExpiredSessionsService.default).toHaveBeenCalled()
      expect(CleanIncompleteCompanyContactsService.default).toHaveBeenCalled()
      expect(CleanOrphanedContactsService.default).toHaveBeenCalled()
    })

    it('logs the time taken in milliseconds and seconds, plus the count of rows deleted', async () => {
      await ProcessCleanService()

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Clean job complete')
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
      vi.spyOn(CleanEmptyBillRunsService, 'default').mockRejectedValue()
    })

    it('does not throw an error', async () => {
      await ProcessCleanService()
    })

    it('logs the error', async () => {
      await ProcessCleanService()

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Clean job failed')
      expect(errorLogArgs[1]).toEqual({})
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })
  })
})
