'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')

// Things we need to stub
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')

// Thing under test
const CleanEmptyVoidReturnLogsService = require('../../../../app/services/jobs/clean/clean-empty-void-return-logs.service.js')

describe('Jobs - Clean - Clean Empty Void Return Logs service', () => {
  let returnLog
  let notifierStub

  beforeEach(async () => {
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

  describe('when the clean is successful', () => {
    describe('and there is a void return without a submission', () => {
      describe('and it was not marked as "received" before being voided', () => {
        beforeEach(async () => {
          returnLog = await ReturnLogHelper.add({ status: 'void' })
        })

        it('removes the return log and returns the count', async () => {
          const result = await CleanEmptyVoidReturnLogsService()

          const existsResults = await ReturnLogModel.query().whereIn('id', [returnLog.id])

          expect(existsResults).toHaveLength(0)

          // We can't check the exact count in case the test deletes void return logs created by other tests
          expect(result).toBeGreaterThan(0)
        })
      })

      describe('but it was marked as "received" before being voided', () => {
        beforeEach(async () => {
          returnLog = await ReturnLogHelper.add({ status: 'void', receivedDate: new Date() })
        })

        it('does not remove the return log and returns the count', async () => {
          const result = await CleanEmptyVoidReturnLogsService()

          const existsResults = await ReturnLogModel.query().whereIn('id', [returnLog.id])

          expect(existsResults).toHaveLength(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes void return logs
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).toEqual('number')
        })
      })
    })

    describe('when there is a void return with a submission', () => {
      beforeEach(async () => {
        returnLog = await ReturnLogHelper.add({ status: 'void' })
        await ReturnSubmissionHelper.add({ returnLogId: returnLog.id })
      })

      it('does not remove the return log and returns the count', async () => {
        const result = await CleanEmptyVoidReturnLogsService()

        const existsResults = await ReturnLogModel.query().whereIn('id', [returnLog.id])

        expect(existsResults).toHaveLength(1)

        // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
        // by other tests. We just want to check we are always getting a number
        expect(typeof result).toEqual('number')
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      Sinon.stub(ReturnLogModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        where: Sinon.stub().returnsThis(),
        whereNotNull: Sinon.stub().returnsThis(),
        whereNotExists: Sinon.stub().rejects()
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanEmptyVoidReturnLogsService()).resolves.toBeDefined()
    })

    it('logs the error', async () => {
      await CleanEmptyVoidReturnLogsService()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).toBe(true)
      expect(errorLogArgs[1]).toEqual({ job: 'clean-empty-void-return-logs' })
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanEmptyVoidReturnLogsService()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
      // by other tests. We just want to check we are always getting a number
      expect(typeof result).toEqual('number')
    })
  })
})
