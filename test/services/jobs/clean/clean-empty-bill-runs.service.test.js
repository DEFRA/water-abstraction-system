'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Things we need to stub
const CancelBillRunService = require('../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js')
const DeleteBillRunService = require('../../../../app/services/bill-runs/cancel/delete-bill-run.service.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
const UnassignBillRunToLicencesService = require('../../../../app/services/bill-runs/unassign-bill-run-to-licences.service.js')

// Thing under test
const CleanEmptyBillRunsService = require('../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js')

describe('Jobs - Clean - Clean Empty Bill Runs service', () => {
  const emptyBillRuns = [{ id: 'b1c10417-77bb-421e-a9ef-15a0d1bc05d8' }, { id: 'ddc7f25f-8b83-4ef1-9b10-bf1d968e2f13' }]

  let cancelBillRunStub
  let deleteBillRunStub
  let emptyBillRunFetchStub
  let notifierStub
  let unassignBillRunStub

  beforeEach(async () => {
    emptyBillRunFetchStub = Sinon.stub()

    Sinon.stub(BillRunModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      where: emptyBillRunFetchStub
    })

    // We'll control whether this one succeeds or not in the tests
    cancelBillRunStub = Sinon.stub(CancelBillRunService, 'go')

    // These we stub to always resolve
    deleteBillRunStub = Sinon.stub(DeleteBillRunService, 'go').resolves()
    unassignBillRunStub = Sinon.stub(UnassignBillRunToLicencesService, 'go').resolves()

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

  describe('when no bill runs are flagged as "empty"', () => {
    beforeEach(async () => {
      emptyBillRunFetchStub.resolves([])
    })

    it('does not attempt to delete any bill runs', async () => {
      await CleanEmptyBillRunsService()

      expect(cancelBillRunStub.called).toBe(false)

      expect(unassignBillRunStub.called).toBe(false)
      expect(deleteBillRunStub.called).toBe(false)
    })
  })

  describe('when there are bill runs flagged as "empty"', () => {
    beforeEach(async () => {
      emptyBillRunFetchStub.resolves(emptyBillRuns)
    })

    describe('and they can be cancelled (CancelBillRunService updates status to "cancel")', () => {
      beforeEach(() => {
        cancelBillRunStub.onFirstCall().resolves({
          id: emptyBillRuns[0].id,
          externalId: 'd704cb32-a309-4a04-9b0e-f316614a5927',
          status: 'cancel'
        })

        cancelBillRunStub.onSecondCall().resolves({
          id: emptyBillRuns[1].id,
          externalId: '4f64f905-94b4-460d-aefc-098f57834085',
          status: 'cancel'
        })
      })

      it('removes the empty bill runs and returns the count', async () => {
        const result = await CleanEmptyBillRunsService()

        expect(cancelBillRunStub.calledTwice).toBe(true)
        expect(cancelBillRunStub.firstCall.calledWith(emptyBillRuns[0].id)).toBe(true)
        expect(cancelBillRunStub.secondCall.calledWith(emptyBillRuns[1].id)).toBe(true)

        expect(unassignBillRunStub.calledTwice).toBe(true)
        expect(unassignBillRunStub.firstCall.calledWith(emptyBillRuns[0].id)).toBe(true)
        expect(unassignBillRunStub.secondCall.calledWith(emptyBillRuns[1].id)).toBe(true)

        expect(deleteBillRunStub.calledTwice).toBe(true)

        expect(result).toEqual(2)
      })
    })

    describe('but one cannot be cancelled (CancelBillRunService does not update status)', () => {
      beforeEach(() => {
        cancelBillRunStub.onFirstCall().resolves({
          id: emptyBillRuns[0].id,
          externalId: 'd704cb32-a309-4a04-9b0e-f316614a5927',
          status: 'cancel'
        })

        cancelBillRunStub.onSecondCall().resolves({
          id: emptyBillRuns[1].id,
          externalId: '4f64f905-94b4-460d-aefc-098f57834085',
          status: 'sending'
        })
      })

      it('removes only the one that could be cancelled and returns the count', async () => {
        const result = await CleanEmptyBillRunsService()

        expect(cancelBillRunStub.calledTwice).toBe(true)
        expect(cancelBillRunStub.firstCall.calledWith(emptyBillRuns[0].id)).toBe(true)
        expect(cancelBillRunStub.secondCall.calledWith(emptyBillRuns[1].id)).toBe(true)

        expect(unassignBillRunStub.calledOnce).toBe(true)
        expect(unassignBillRunStub.firstCall.calledWith(emptyBillRuns[0].id)).toBe(true)

        expect(deleteBillRunStub.calledOnce).toBe(true)

        expect(result).toEqual(1)
      })
    })
  })

  describe('when the clean errors', () => {
    describe('whilst fetching the empty bill runs', () => {
      beforeEach(() => {
        emptyBillRunFetchStub.rejects()
      })

      it('does not throw an error', async () => {
        await expect(CleanEmptyBillRunsService()).resolves.toBeDefined()
      })

      it('logs the error with no bill run ID', async () => {
        await CleanEmptyBillRunsService()

        const errorLogArgs = notifierStub.omfg.firstCall.args

        expect(notifierStub.omfg.calledWith('Clean job failed')).toBe(true)
        expect(errorLogArgs[1]).toEqual({ billRunId: undefined, job: 'clean-empty-bill-runs' })
        expect(errorLogArgs[2]).toBeInstanceOf(Error)
      })

      it('still returns a count', async () => {
        const result = await CleanEmptyBillRunsService()

        expect(result).toEqual(0)
      })
    })

    describe('whilst cancelling a bill run', () => {
      beforeEach(() => {
        emptyBillRunFetchStub.resolves(emptyBillRuns)

        cancelBillRunStub.rejects()
      })

      it('does not throw an error', async () => {
        await expect(CleanEmptyBillRunsService()).resolves.toBeDefined()
      })

      it('logs the error including the ID of the bill run that errored', async () => {
        await CleanEmptyBillRunsService()

        const errorLogArgs = notifierStub.omfg.firstCall.args

        expect(notifierStub.omfg.calledWith('Clean job failed')).toBe(true)
        expect(errorLogArgs[1]).toEqual({ billRunId: emptyBillRuns[0].id, job: 'clean-empty-bill-runs' })
        expect(errorLogArgs[2]).toBeInstanceOf(Error)
      })

      it('still returns a count', async () => {
        const result = await CleanEmptyBillRunsService()

        expect(result).toEqual(0)
      })
    })
  })
})
