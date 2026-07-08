// Test framework dependencies

// Things we need to stub
import * as AssignBillRunToLicencesService from '../../../../app/services/bill-runs/assign-bill-run-to-licences.service.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'
import * as GenerateBillRunService from '../../../../app/services/bill-runs/tpt-supplementary/generate-bill-run.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as HandleErroredBillRunService from '../../../../app/services/bill-runs/handle-errored-bill-run.service.js'
import * as MatchAndAllocateService from '../../../../app/services/bill-runs/match/match-and-allocate.service.js'

// Thing under test
import ProcessBillRunService from '../../../../app/services/bill-runs/tpt-supplementary/process-bill-run.service.js'

describe('Bill Runs - TPT Supplementary - Process Bill Run service', () => {
  const billingPeriods = [{ startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') }]
  const billRun = { id: '410c84a5-39d3-441a-97ca-6104e14d00a2' }

  let billRunPatchStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = vi.fn().mockResolvedValue()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: billRunPatchStub
    })


    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
    vi.spyOn(HandleErroredBillRunService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      vi.spyOn(AssignBillRunToLicencesService, 'default').mockResolvedValue()
    })

    describe('and no licences are matched and allocated', () => {
      beforeEach(() => {
        vi.spyOn(MatchAndAllocateService, 'default').mockResolvedValue(false)
        vi.spyOn(GenerateBillRunService, 'default').mockResolvedValue()
      })

      it('sets the bill run status only to "processing"', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(billRunPatchStub).toHaveBeenCalledOnce()
        expect(billRunPatchStub.mock.calls[0][0]).toEqual({ status: 'processing' })
      })

      it('skips to "generating" the bill run', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(GenerateBillRunService.default).toHaveBeenCalledOnce()
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omg.mock.calls[0]

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
        expect(args[1].type).toEqual('two_part_supplementary')
      })
    })

    describe('and licences are matched and allocated', () => {
      beforeEach(() => {
        // NOTE: ProcessBillRunService orchestrates the creation of a bill run. The actual work is done in the services
        // it is calling. As long as MatchAndAllocateService returns a 'licence', ProcessBillRunService will trigger the
        // work to happen. This is why for these tests it is not critical what we stub MatchAndAllocateService to
        // return, only that it returns something!
        vi.spyOn(MatchAndAllocateService, 'default').mockResolvedValue(true)
      })

      it('sets the bill run status first to "processing" and then to "review"', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(billRunPatchStub).toHaveBeenCalledTimes(2)
        expect(billRunPatchStub.mock.calls[0][0]).toEqual({ status: 'processing' })
        expect(billRunPatchStub.mock.calls[1][0]).toEqual({ status: 'review' })
      })

      it('does not skip to "generating" the bill run', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(GenerateBillRunService.default).not.toHaveBeenCalled()
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omg.mock.calls[0]

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
        expect(args[1].type).toEqual('two_part_supplementary')
      })
    })
  })

  describe('when the service errors', () => {
    describe('because assigning the bill run to the licences fails', () => {
      beforeEach(() => {
        vi.spyOn(AssignBillRunToLicencesService, 'default').mockRejectedValue(new Error())
      })

      it('calls HandleErroredBillRunService', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(HandleErroredBillRunService.default).toHaveBeenCalled()
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Process bill run failed')
        expect(args[1].billRun.id).toEqual(billRun.id)
        expect(args[2]).toBeInstanceOf(Error)
      })
    })

    describe('because matching and allocating fails', () => {
      beforeEach(() => {
        vi.spyOn(AssignBillRunToLicencesService, 'default').mockResolvedValue()
        vi.spyOn(MatchAndAllocateService, 'default').mockRejectedValue(new Error())
      })

      it('calls HandleErroredBillRunService', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(HandleErroredBillRunService.default).toHaveBeenCalled()
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Process bill run failed')
        expect(args[1].billRun.id).toEqual(billRun.id)
        expect(args[2]).toBeInstanceOf(Error)
      })
    })
  })
})
