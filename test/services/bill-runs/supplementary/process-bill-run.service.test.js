'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleGenerateBillRunRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
const UnflagUnbilledSupplementaryLicencesService = require('../../../../app/services/bill-runs/unflag-unbilled-supplementary-licences.service.js')

// Thing under test
const ProcessBillRunService = require('../../../../app/services/bill-runs/supplementary/process-bill-run.service.js')

describe('Bill Runs - Supplementary - Process Bill Run service', () => {
  const billingPeriods = [
    { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
    { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  ]
  const billRun = { id: '410c84a5-39d3-441a-97ca-6104e14d00a2' }

  let billRunPatchStub
  let chargingModuleGenerateBillRunRequestStub
  let handleErroredBillRunStub
  let legacyRefreshBillRunRequestStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = Sinon.stub().resolves()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      patch: billRunPatchStub
    })

    handleErroredBillRunStub = Sinon.stub(HandleErroredBillRunService, 'go')
    chargingModuleGenerateBillRunRequestStub = Sinon.stub(ChargingModuleGenerateBillRunRequest, 'send')
    legacyRefreshBillRunRequestStub = Sinon.stub(LegacyRefreshBillRunRequest, 'send')

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

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
      Sinon.stub(UnflagUnbilledSupplementaryLicencesService, 'go')
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
      })

      it('sets the bill run status first to "processing" and then to "empty"', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(billRunPatchStub.calledTwice).toBe(true)
        expect(billRunPatchStub.firstCall.firstArg).toEqual({ status: 'processing' })
        expect(billRunPatchStub.secondCall.firstArg).toEqual({ status: 'empty' })
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).toEqual('Process bill run complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].billRunId).toEqual(billRun.id)
        expect(args[1].type).toEqual('supplementary')
      })
    })

    describe('and some charge versions are billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the bill run status to "processing"', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(billRunPatchStub.calledOnce).toBe(true)
        expect(billRunPatchStub.firstCall.firstArg).toMatchObject({ status: 'processing' })
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(chargingModuleGenerateBillRunRequestStub.called).toBe(true)
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(legacyRefreshBillRunRequestStub.called).toBe(true)
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

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

        Sinon.stub(FetchChargeVersionsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

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

          Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects(thrownError)
        })

        it('calls HandleErroredBillRunService with the error code', async () => {
          await ProcessBillRunService.go(billRun, billingPeriods)

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillRunService.go(billRun, billingPeriods)

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

        Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
        Sinon.stub(UnflagUnbilledSupplementaryLicencesService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService without an error code', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).toBeUndefined()
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

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
