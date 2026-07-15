// Test helpers
import BillRunError from '../../../../app/errors/bill-run.error.js'
import * as BillRunHelper from '../../../support/helpers/bill-run.helper.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'
import { determineCurrentFinancialYear } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as ChargingModuleGenerateRequest from '../../../../app/requests/charging-module/generate-bill-run.request.js'
import * as FetchBillingAccountsService from '../../../../app/services/bill-runs/annual/fetch-billing-accounts.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as HandleErroredBillRunService from '../../../../app/services/bill-runs/handle-errored-bill-run.service.js'
import * as LegacyRefreshBillRunRequest from '../../../../app/requests/legacy/refresh-bill-run.request.js'
import * as ProcessBillingPeriodService from '../../../../app/services/bill-runs/annual/process-billing-period.service.js'

// Thing under test
import ProcessBillRunService from '../../../../app/services/bill-runs/annual/process-bill-run.service.js'

describe('Annual Process Bill Run service', () => {
  const billingPeriod = determineCurrentFinancialYear()

  let billRun
  let notifierStub

  beforeEach(async () => {
    const financialYearEnd = billingPeriod.startDate.getFullYear()

    billRun = await BillRunHelper.add({
      batchType: 'annual',
      fromFinancialYearEnding: financialYearEnd,
      toFinancialYearEnding: financialYearEnd
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

  describe('when the service is called', () => {
    beforeEach(() => {
      vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue([])
    })

    describe('and nothing is billed', () => {
      it('sets the bill run status to "empty"', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).toEqual('empty')
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

      it('sets the bill run status to "processing"', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).toEqual('processing')
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        expect(chargingModuleGenerateRequestStub).toHaveBeenCalled()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        expect(legacyRefreshBillRunRequestStub).toHaveBeenCalled()
      })
    })
  })

  describe('when the service errors', () => {
    let thrownError

    beforeEach(() => {})

    describe('because fetching the billing accounts fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        vi.spyOn(FetchBillingAccountsService, 'default').mockRejectedValue(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const handlerArgs = HandleErroredBillRunService.default.mock.calls[0]

        expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

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

          vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue([])
          vi.spyOn(ProcessBillingPeriodService, 'default').mockRejectedValue(thrownError)
        })

        it('calls HandleErroredBillRunService with appropriate error code', async () => {
          await ProcessBillRunService(billRun, [billingPeriod])

          const handlerArgs = HandleErroredBillRunService.default.mock.calls[0]

          expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillRunService(billRun, [billingPeriod])

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

        vi.spyOn(FetchBillingAccountsService, 'default').mockResolvedValue([])
        vi.spyOn(ProcessBillingPeriodService, 'default').mockResolvedValue(true)
        vi.spyOn(ChargingModuleGenerateRequest, 'send').mockRejectedValue(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const handlerArgs = HandleErroredBillRunService.default.mock.calls[0]

        expect(handlerArgs[1]).toBeUndefined()
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

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
