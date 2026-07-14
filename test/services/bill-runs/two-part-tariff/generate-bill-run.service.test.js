// Test helpers
import BillRunError from '../../../../app/errors/bill-run.error.js'

// Things we need to stub
import BillRunModel from '../../../../app/models/bill-run.model.js'
import * as ChargingModuleGenerateRequest from '../../../../app/requests/charging-module/generate-bill-run.request.js'
import * as FetchBillingAccountsService from '../../../../app/services/bill-runs/two-part-tariff/fetch-billing-accounts.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as HandleErroredBillRunService from '../../../../app/services/bill-runs/handle-errored-bill-run.service.js'
import * as LegacyRefreshBillRunRequest from '../../../../app/requests/legacy/refresh-bill-run.request.js'
import * as ProcessBillingPeriodService from '../../../../app/services/bill-runs/two-part-tariff/process-billing-period.service.js'

// Thing under test
import GenerateBillRunService from '../../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js'

describe('Bill Runs - Two Part Tariff - Generate Bill Run service', () => {
  const billRun = {
    batchType: 'two_part_tariff',
    fromFinancialYearEnding: 2023,
    id: '8aaaf207-fd0e-4a10-9ac6-b89f68250e0f',
    status: 'review',
    toFinancialYearEnding: 2023
  }

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
    vi.spyOn(HandleErroredBillRunService, 'default').mockResolvedValue()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when called', () => {
    beforeEach(() => {
      // We stub FetchTwoPartTariffBillingAccountsService to return no results in all scenarios because it is the result
      // of ProcessBillingPeriodService which determines if there is anything to bill. We change the stub of that
      // service to dictate the scenario we're trying to test.
      vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue([])
    })

    describe('but there is nothing to bill', () => {
      beforeEach(async () => {
        vi.spyOn(ProcessBillingPeriodService, 'default').mockResolvedValue(false)
      })

      it('sets the bill run status to "empty"', async () => {
        await GenerateBillRunService(billRun)

        expect(billRunPatchStub).toHaveBeenCalledOnce()
        expect(billRunPatchStub.mock.calls[0][0]).toMatchObject({ status: 'empty' })
      })
    })

    describe('and something is billed', () => {
      let chargingModuleGenerateRequestStub
      let legacyRefreshBillRunRequestStub

      beforeEach(() => {
        chargingModuleGenerateRequestStub = vi.spyOn(ChargingModuleGenerateRequest, 'send').mockImplementation(() => {})
        legacyRefreshBillRunRequestStub = vi.spyOn(LegacyRefreshBillRunRequest, 'send').mockImplementation(() => {})

        vi.spyOn(ProcessBillingPeriodService, 'default').mockResolvedValue(true)
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await GenerateBillRunService(billRun)

        expect(chargingModuleGenerateRequestStub).toHaveBeenCalled()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await GenerateBillRunService(billRun)

        expect(legacyRefreshBillRunRequestStub).toHaveBeenCalled()
      })
    })
  })

  describe('when the service errors', () => {
    let thrownError

    beforeEach(async () => {})

    describe('because fetching the billing accounts fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        vi.spyOn(FetchBillingAccountsService, 'default').mockRejectedValue(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await GenerateBillRunService(billRun)

        const handlerArgs = HandleErroredBillRunService.default.mock.calls[0]

        expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await GenerateBillRunService(billRun)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Generate annual two-part tariff bill run failed')
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

          vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue([])
          vi.spyOn(ProcessBillingPeriodService, 'default').mockRejectedValue(thrownError)
        })

        it('calls HandleErroredBillRunService with appropriate error code', async () => {
          await GenerateBillRunService(billRun)

          const handlerArgs = HandleErroredBillRunService.default.mock.calls[0]

          expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await GenerateBillRunService(billRun)

          const args = notifierStub.omfg.mock.calls[0]

          expect(args[0]).toEqual('Generate annual two-part tariff bill run failed')
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

        vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue([])
        vi.spyOn(ProcessBillingPeriodService, 'default').mockResolvedValue(true)
        vi.spyOn(ChargingModuleGenerateRequest, 'send').mockRejectedValue(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await GenerateBillRunService(billRun)

        const handlerArgs = HandleErroredBillRunService.default.mock.calls[0]

        expect(handlerArgs[1]).toBeUndefined()
      })

      it('logs the error', async () => {
        await GenerateBillRunService(billRun)

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Generate annual two-part tariff bill run failed')
        expect(args[1].billRun.id).toEqual(billRun.id)
        expect(args[2]).toBeInstanceOf(Error)
        expect(args[2].name).toEqual(thrownError.name)
        expect(args[2].message).toEqual(thrownError.message)
        expect(args[2].code).toBeUndefined()
      })
    })
  })
})
