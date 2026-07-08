// Test framework dependencies

// Test helpers
import * as SessionHelper from '../../../support/helpers/session.helper.js'
import SessionModel from '../../../../app/models/session.model.js'
import { today } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import CleanExpiredSessionsService from '../../../../app/services/jobs/clean/clean-expired-sessions.service.js'

describe('Jobs - Clean - Clean Expired Sessions service', () => {
  const todaysDate = today()
  const todayMinusOneDay = new Date(todaysDate.setDate(todaysDate.getDate() - 1)).toISOString()

  let notifierStub
  let session

  beforeEach(async () => {
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

  describe('when the clean is successful', () => {
    describe('when there is a session created more than 1 day ago', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ createdAt: todayMinusOneDay })
      })

      it('removes the session and returns the count', async () => {
        const result = await CleanExpiredSessionsService()

        const existsResults = await SessionModel.query().whereIn('id', [session.id])

        expect(existsResults).toHaveLength(0)

        // We can't check the exact count in case the test deletes void return logs created by other tests
        expect(result).toBeGreaterThan(0)
      })
    })

    describe('when there is a session created less than 1 day ago (today)', () => {
      beforeEach(async () => {
        session = await SessionHelper.add()
      })

      it('does not remove the session and returns the count', async () => {
        const result = await CleanExpiredSessionsService()

        const existsResults = await SessionModel.query().whereIn('id', [session.id])

        expect(existsResults).toHaveLength(1)

        // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
        // by other tests. We just want to check we are always getting a number
        expect(typeof result).toEqual('number')
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      vi.spyOn(SessionModel, 'query').mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().rejects()
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanExpiredSessionsService()).resolves.toBeDefined()
    })

    it('logs the error', async () => {
      await CleanExpiredSessionsService()

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Clean job failed')
      expect(errorLogArgs[1]).toEqual({ job: 'clean-expired-sessions' })
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanExpiredSessionsService()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created by
      // other tests. We just want to check we are always getting a number
      expect(typeof result).toEqual('number')
    })
  })
})
