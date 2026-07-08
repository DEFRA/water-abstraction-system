// Test framework dependencies

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import HandleErroredBillRunService from '../../../../app/services/bill-runs/handle-errored-bill-run.service.js'
import MatchAndAllocateService from '../../../../app/services/bill-runs/match/match-and-allocate.service.js'

// Thing under test
import ProcessBillRunService from '../../../../app/services/bill-runs/two-part-tariff/process-bill-run.service.js'

describe('Bill Runs - Two Part Tariff - Process Bill Run service', () => {
  const billingPeriods = [{ startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }]
  const billRun = { id: '410c84a5-39d3-441a-97ca-6104e14d00a2' }

  let billRunPatchStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = vi.fn().mockResolvedValue()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: billRunPatchStub
    })

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

  describe('when the service is called', () => {
    describe('and there are no licences to be billed', () => {
      beforeEach(() => {
        vi.mock('../../../../app/services/bill-runs/match/match-and-allocate.service.js')
        MatchAndAllocateService.mockResolvedValue(false)
      })

      it('sets the bill run status first to "processing" and then to "empty"', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(billRunPatchStub.calledTwice).toBe(true)
        expect(billRunPatchStub.firstCall.firstArg).toEqual({ status: 'processing' })
        expect(billRunPatchStub.secondCall.firstArg).toEqual({ status: 'empty' })
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
        expect(args[1].type).toEqual('two_part_tariff')
      })
    })

    describe('and licences are matched and allocated', () => {
      beforeEach(() => {
        vi.mock('../../../../app/services/bill-runs/match/match-and-allocate.service.js')
        MatchAndAllocateService.mockResolvedValue(true)
      })

      it('sets the bill run status first to "processing" and then to "review"', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(billRunPatchStub.calledTwice).toBe(true)
        expect(billRunPatchStub.firstCall.firstArg).toEqual({ status: 'processing' })
        expect(billRunPatchStub.secondCall.firstArg).toEqual({ status: 'review' })
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
        expect(args[1].type).toEqual('two_part_tariff')
      })
    })
  })

  describe('when the service errors', () => {
    describe('because matching and allocating fails', () => {
      beforeEach(() => {
        vi.mock('../../../../app/services/bill-runs/match/match-and-allocate.service.js')
        MatchAndAllocateService.mockRejectedValue('MatchAndAllocateService has gone pop')
        vi.mock('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
      })

      it('calls HandleErroredBillRunService', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(HandleErroredBillRunService.go).toHaveBeenCalled()
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).toEqual('Process bill run failed')
        expect(args[1].billRun.id).toEqual(billRun.id)
        expect(args[2]).toBeInstanceOf(Error)
        expect(args[2].name).toEqual('MatchAndAllocateService has gone pop')
      })
    })
  })
})
