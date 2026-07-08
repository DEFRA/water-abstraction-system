'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const ChargingModuleGenerateRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/annual/fetch-billing-accounts.service.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/annual/process-billing-period.service.js')

// Thing under test
const ProcessBillRunService = require('../../../../app/services/bill-runs/annual/process-bill-run.service.js')

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
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
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
        chargingModuleGenerateRequestStub = Sinon.stub(ChargingModuleGenerateRequest, 'send')
        legacyRefreshBillRunRequestStub = Sinon.stub(LegacyRefreshBillRunRequest, 'send')

        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the bill run status to "processing"', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).toEqual('processing')
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        expect(chargingModuleGenerateRequestStub.called).toBe(true)
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        expect(legacyRefreshBillRunRequestStub.called).toBe(true)
      })
    })
  })

  describe('when the service errors', () => {
    let handleErroredBillRunStub
    let thrownError

    beforeEach(() => {
      handleErroredBillRunStub = Sinon.stub(HandleErroredBillRunService, 'go')
    })

    describe('because fetching the billing accounts fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchBillingAccountsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const args = notifierStub.omfg.firstCall.args

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

          Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects(thrownError)
        })

        it('calls HandleErroredBillRunService with appropriate error code', async () => {
          await ProcessBillRunService(billRun, [billingPeriod])

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillRunService(billRun, [billingPeriod])

          const args = notifierStub.omfg.firstCall.args

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

        Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
        Sinon.stub(ChargingModuleGenerateRequest, 'send').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).toBeUndefined()
      })

      it('logs the error', async () => {
        await ProcessBillRunService(billRun, [billingPeriod])

        const args = notifierStub.omfg.firstCall.args

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
