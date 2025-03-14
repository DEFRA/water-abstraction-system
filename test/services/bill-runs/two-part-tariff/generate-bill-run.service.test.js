'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleGenerateRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-billing-accounts.service.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/two-part-tariff/process-billing-period.service.js')

// Thing under test
const GenerateBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')

describe('Bill Runs - Two Part Tariff - Generate Bill Run service', () => {
  const billRun = {
    batchType: 'two_part_tariff',
    fromFinancialYearEnding: 2023,
    id: '8aaaf207-fd0e-4a10-9ac6-b89f68250e0f',
    status: 'review',
    toFinancialYearEnding: 2023
  }

  let billRunPatchStub
  let processBillingPeriodStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = Sinon.stub().resolves()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      patch: billRunPatchStub
    })

    processBillingPeriodStub = Sinon.stub(ProcessBillingPeriodService, 'go')

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    beforeEach(() => {
      // We stub FetchTwoPartTariffBillingAccountsService to return no results in all scenarios because it is the result
      // of ProcessBillingPeriodService which determines if there is anything to bill. We change the stub of that
      // service to dictate the scenario we're trying to test.
      Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
    })

    describe('but there is nothing to bill', () => {
      beforeEach(async () => {
        processBillingPeriodStub.resolves(false)
      })

      it('sets the bill run status to "empty"', async () => {
        await GenerateBillRunService.go(billRun)

        expect(billRunPatchStub.calledOnce).to.be.true()
        expect(billRunPatchStub.firstCall.firstArg).to.equal({ status: 'empty' }, { skip: ['updatedAt'] })
      })
    })

    describe('and something is billed', () => {
      let chargingModuleGenerateRequestStub
      let legacyRefreshBillRunRequestStub

      beforeEach(() => {
        chargingModuleGenerateRequestStub = Sinon.stub(ChargingModuleGenerateRequest, 'send')
        legacyRefreshBillRunRequestStub = Sinon.stub(LegacyRefreshBillRunRequest, 'send')

        processBillingPeriodStub.resolves(true)
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await GenerateBillRunService.go(billRun)

        expect(chargingModuleGenerateRequestStub.called).to.be.true()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await GenerateBillRunService.go(billRun)

        expect(legacyRefreshBillRunRequestStub.called).to.be.true()
      })
    })
  })

  describe('when the service errors', () => {
    let handleErroredBillRunStub
    let thrownError

    beforeEach(async () => {
      handleErroredBillRunStub = Sinon.stub(HandleErroredBillRunService, 'go')
    })

    describe('because fetching the billing accounts fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchBillingAccountsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await GenerateBillRunService.go(billRun)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await GenerateBillRunService.go(billRun)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Generate annual two-part tariff bill run failed')
        expect(args[1].billRun.id).to.equal(billRun.id)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal(thrownError.name)
        expect(args[2].message).to.equal(`Error: ${thrownError.message}`)
        expect(args[2].code).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })
    })

    describe('because the process billing period service fails', () => {
      describe('and the error thrown has an error code', () => {
        beforeEach(() => {
          thrownError = new BillRunError(new Error(), BillRunModel.errorCodes.failedToPrepareTransactions)

          Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
          processBillingPeriodStub.rejects(thrownError)
        })

        it('calls HandleErroredBillRunService with appropriate error code', async () => {
          await GenerateBillRunService.go(billRun)

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await GenerateBillRunService.go(billRun)

          const args = notifierStub.omfg.firstCall.args

          expect(args[0]).to.equal('Generate annual two-part tariff bill run failed')
          expect(args[1].billRun.id).to.equal(billRun.id)
          expect(args[2]).to.be.an.error()
          expect(args[2].name).to.equal(thrownError.name)
          expect(args[2].message).to.equal(thrownError.message)
          expect(args[2].code).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })
      })
    })

    describe('because finalising the bill run fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
        processBillingPeriodStub.resolves(true)
        Sinon.stub(ChargingModuleGenerateRequest, 'send').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await GenerateBillRunService.go(billRun)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await GenerateBillRunService.go(billRun)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Generate annual two-part tariff bill run failed')
        expect(args[1].billRun.id).to.equal(billRun.id)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal(thrownError.name)
        expect(args[2].message).to.equal(thrownError.message)
        expect(args[2].code).to.be.undefined()
      })
    })
  })
})
