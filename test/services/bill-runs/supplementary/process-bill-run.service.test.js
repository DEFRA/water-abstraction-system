// Test framework dependencies

// Test helpers
import BillRunError from '../../../../app/errors/bill-run.error.js'

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'
import * as ChargingModuleGenerateBillRunRequest from '../../../../app/requests/charging-module/generate-bill-run.request.js'
import FetchChargeVersionsService from '../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import HandleErroredBillRunService from '../../../../app/services/bill-runs/handle-errored-bill-run.service.js'
import * as LegacyRefreshBillRunRequest from '../../../../app/requests/legacy/refresh-bill-run.request.js'
import ProcessBillingPeriodService from '../../../../app/services/bill-runs/supplementary/process-billing-period.service.js'
import UnflagUnbilledSupplementaryLicencesService from '../../../../app/services/bill-runs/unflag-unbilled-supplementary-licences.service.js'

// Thing under test
import ProcessBillRunService from '../../../../app/services/bill-runs/supplementary/process-bill-run.service.js'

describe('Bill Runs - Supplementary - Process Bill Run service', () => {
  const billingPeriods = [
    { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
    { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  ]
  const billRun = { id: '410c84a5-39d3-441a-97ca-6104e14d00a2' }

  let billRunPatchStub
  let chargingModuleGenerateBillRunRequestStub
  let legacyRefreshBillRunRequestStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = vi.fn().mockResolvedValue()

    vi.spyOn(BillRunModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: billRunPatchStub
    })

    vi.mock('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
    chargingModuleGenerateBillRunRequestStub = vi
      .spyOn(ChargingModuleGenerateBillRunRequest, 'send')
      .mockImplementation(() => {})
    legacyRefreshBillRunRequestStub = vi.spyOn(LegacyRefreshBillRunRequest, 'send').mockImplementation(() => {})

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
    beforeEach(() => {
      vi.mock('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
      FetchChargeVersionsService.mockResolvedValue({ chargeVersions: [], licenceIdsForPeriod: [] })
      vi.mock('../../../../app/services/bill-runs/unflag-unbilled-supplementary-licences.service.js')
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        vi.mock('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
        ProcessBillingPeriodService.mockResolvedValue(false)
      })

      it('sets the bill run status first to "processing" and then to "empty"', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(billRunPatchStub.calledTwice).toBe(true)
        expect(billRunPatchStub.firstCall.firstArg).toEqual({ status: 'processing' })
        expect(billRunPatchStub.secondCall.firstArg).toEqual({ status: 'empty' })
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omg.mock.calls[0]

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
        expect(args[1].type).toEqual('supplementary')
      })
    })

    describe('and some charge versions are billed', () => {
      beforeEach(() => {
        vi.mock('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
        ProcessBillingPeriodService.mockResolvedValue(true)
      })

      it('sets the bill run status to "processing"', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(billRunPatchStub).toHaveBeenCalledOnce()
        expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'processing' })
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(chargingModuleGenerateBillRunRequestStub).toHaveBeenCalled()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        expect(legacyRefreshBillRunRequestStub).toHaveBeenCalled()
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omg.mock.calls[0]

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
      })
    })
  })

  describe('when the service errors', () => {
    let thrownError

    describe('because fetching the charge versions fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        vi.mock('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
        FetchChargeVersionsService.mockRejectedValue(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const handlerArgs = HandleErroredBillRunService.mock.calls[0]

        expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Bill run process errored')
        expect(args[1].billRun.id).toEqual(billRun.id)
        expect(args[2]).toBeInstanceOf(Error)
        expect(args[2].name).toEqual(thrownError.name)
        expect(args[2].message).toEqual(`Error: ${thrownError.message}`)
        expect(args[2].code).toEqual(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })
    })

    describe('because the process billing period service fails', () => {
      describe('and the error thrown has an error code', () => {
        beforeEach(() => {
          thrownError = new BillRunError(new Error(), BillRunModel.errorCodes.failedToPrepareTransactions)

          vi.mock('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
          FetchChargeVersionsService.mockResolvedValue({ chargeVersions: [], licenceIdsForPeriod: [] })
          vi.mock('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
          ProcessBillingPeriodService.mockRejectedValue(thrownError)
        })

        it('calls HandleErroredBillRunService with the error code', async () => {
          await ProcessBillRunService(billRun, billingPeriods)

          const handlerArgs = HandleErroredBillRunService.mock.calls[0]

          expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillRunService(billRun, billingPeriods)

          const args = notifierStub.omfg.mock.calls[0]

          expect(args[0]).toEqual('Bill run process errored')
          expect(args[1].billRun.id).toEqual(billRun.id)
          expect(args[2]).toBeInstanceOf(Error)
          expect(args[2].name).toEqual(thrownError.name)
          expect(args[2].message).toEqual(thrownError.message)
          expect(args[2].code).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
        })
      })
    })

    describe('because finalising the bill run fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        vi.mock('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
        FetchChargeVersionsService.mockResolvedValue({ chargeVersions: [], licenceIdsForPeriod: [] })
        vi.mock('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
        ProcessBillingPeriodService.mockResolvedValue(false)
        vi.mock('../../../../app/services/bill-runs/unflag-unbilled-supplementary-licences.service.js')
        UnflagUnbilledSupplementaryLicencesService.mockRejectedValue(thrownError)
      })

      it('calls HandleErroredBillRunService without an error code', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const handlerArgs = HandleErroredBillRunService.mock.calls[0]

        expect(handlerArgs[1]).toBeUndefined()
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, billingPeriods)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Bill run process errored')
        expect(args[1].billRun.id).toEqual(billRun.id)
        expect(args[2]).toBeInstanceOf(Error)
        expect(args[2].name).toEqual(thrownError.name)
        expect(args[2].message).toEqual(thrownError.message)
        expect(args[2].code).toBeUndefined()
      })
    })
  })
})
