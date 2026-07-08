// Test framework dependencies

// Test helpers
import BillRunModel from '../../../../app/models/bill-run.model.js'

// Things we need to stub
import * as CancelBillRunService from '../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js'
import * as DeleteBillRunService from '../../../../app/services/bill-runs/cancel/delete-bill-run.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as UnassignBillRunToLicencesService from '../../../../app/services/bill-runs/unassign-bill-run-to-licences.service.js'

// Thing under test
import CleanEmptyBillRunsService from '../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js'

describe('Jobs - Clean - Clean Empty Bill Runs service', () => {
  const emptyBillRuns = [{ id: 'b1c10417-77bb-421e-a9ef-15a0d1bc05d8' }, { id: 'ddc7f25f-8b83-4ef1-9b10-bf1d968e2f13' }]
  let emptyBillRunFetchStub
  let notifierStub
  beforeEach(async () => {
    emptyBillRunFetchStub = vi.fn()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      where: emptyBillRunFetchStub
    })

    // We'll control whether this one succeeds or not in the tests
    vi.spyOn(CancelBillRunService, 'default').mockResolvedValue()

    // These we stub to always resolve
    vi.spyOn(DeleteBillRunService, 'default').mockResolvedValue()
    vi.spyOn(UnassignBillRunToLicencesService, 'default').mockResolvedValue()

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

  describe('when no bill runs are flagged as "empty"', () => {
    beforeEach(async () => {
      emptyBillRunFetchStub.mockResolvedValue([])
    })

    it('does not attempt to delete any bill runs', async () => {
      await CleanEmptyBillRunsService()

      expect(CancelBillRunService.default).not.toHaveBeenCalled()

      expect(UnassignBillRunToLicencesService.default).not.toHaveBeenCalled()
      expect(DeleteBillRunService.default).not.toHaveBeenCalled()
    })
  })

  describe('when there are bill runs flagged as "empty"', () => {
    beforeEach(async () => {
      emptyBillRunFetchStub.mockResolvedValue(emptyBillRuns)
    })

    describe('and they can be cancelled (CancelBillRunService updates status to "cancel")', () => {
      beforeEach(() => {
        vi.spyOn(CancelBillRunService, 'default')
          .mockResolvedValueOnce({
            id: emptyBillRuns[0].id,
            externalId: 'd704cb32-a309-4a04-9b0e-f316614a5927',
            status: 'cancel'
          })
          .mockResolvedValueOnce({
            id: emptyBillRuns[1].id,
            externalId: '4f64f905-94b4-460d-aefc-098f57834085',
            status: 'cancel'
          })
      })

      it('removes the empty bill runs and returns the count', async () => {
        const result = await CleanEmptyBillRunsService()

        expect(CancelBillRunService.default).toHaveBeenCalledTimes(2)
        expect(CancelBillRunService.default).toHaveBeenNthCalledWith(1, emptyBillRuns[0].id)
        expect(CancelBillRunService.default).toHaveBeenNthCalledWith(2, emptyBillRuns[1].id)

        expect(UnassignBillRunToLicencesService.default).toHaveBeenCalledTimes(2)
        expect(UnassignBillRunToLicencesService.default).toHaveBeenNthCalledWith(1, emptyBillRuns[0].id)
        expect(UnassignBillRunToLicencesService.default).toHaveBeenNthCalledWith(2, emptyBillRuns[1].id)

        expect(DeleteBillRunService.default).toHaveBeenCalledTimes(2)

        expect(result).toEqual(2)
      })
    })

    describe('but one cannot be cancelled (CancelBillRunService does not update status)', () => {
      beforeEach(() => {
        vi.spyOn(CancelBillRunService, 'default')
          .mockResolvedValueOnce({
            id: emptyBillRuns[0].id,
            externalId: 'd704cb32-a309-4a04-9b0e-f316614a5927',
            status: 'cancel'
          })
          .mockResolvedValueOnce({
            id: emptyBillRuns[1].id,
            externalId: '4f64f905-94b4-460d-aefc-098f57834085',
            status: 'sending'
          })
      })

      it('removes only the one that could be cancelled and returns the count', async () => {
        const result = await CleanEmptyBillRunsService()

        expect(CancelBillRunService.default).toHaveBeenCalledTimes(2)
        expect(CancelBillRunService.default).toHaveBeenNthCalledWith(1, emptyBillRuns[0].id)
        expect(CancelBillRunService.default).toHaveBeenNthCalledWith(2, emptyBillRuns[1].id)

        expect(UnassignBillRunToLicencesService.default).toHaveBeenCalledOnce()
        expect(UnassignBillRunToLicencesService.default).toHaveBeenNthCalledWith(1, emptyBillRuns[0].id)

        expect(DeleteBillRunService.default).toHaveBeenCalledOnce()

        expect(result).toEqual(1)
      })
    })
  })

  describe('when the clean errors', () => {
    describe('whilst fetching the empty bill runs', () => {
      beforeEach(() => {
        emptyBillRunFetchStub.mockRejectedValue(new Error('test error'))
      })

      it('does not throw an error', async () => {
        await expect(CleanEmptyBillRunsService()).resolves.toBeDefined()
      })

      it('logs the error with no bill run ID', async () => {
        await CleanEmptyBillRunsService()

        const errorLogArgs = notifierStub.omfg.mock.calls[0]

        expect(notifierStub.omfg).toHaveBeenCalledWith('Clean job failed', expect.any(Object), expect.any(Error))
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
        emptyBillRunFetchStub.mockResolvedValue(emptyBillRuns)

        vi.spyOn(CancelBillRunService, 'default').mockRejectedValue(new Error('test error'))
      })

      it('does not throw an error', async () => {
        await expect(CleanEmptyBillRunsService()).resolves.toBeDefined()
      })

      it('logs the error including the ID of the bill run that errored', async () => {
        await CleanEmptyBillRunsService()

        const errorLogArgs = notifierStub.omfg.mock.calls[0]

        expect(notifierStub.omfg).toHaveBeenCalledWith('Clean job failed', expect.any(Object), expect.any(Error))
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
