'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const ChargingModuleGenerateRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/annual/fetch-billing-accounts.service.js')
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
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
    })

    describe('and nothing is billed', () => {
      it('sets the bill run status to "empty"', async () => {
        await ProcessBillRunService.go(billRun, [billingPeriod])

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('empty')
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
        await ProcessBillRunService.go(billRun, [billingPeriod])

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('processing')
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await ProcessBillRunService.go(billRun, [billingPeriod])

        expect(chargingModuleGenerateRequestStub.called).to.be.true()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillRunService.go(billRun, [billingPeriod])

        expect(legacyRefreshBillRunRequestStub.called).to.be.true()
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
        await ProcessBillRunService.go(billRun, [billingPeriod])

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, [billingPeriod])

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Bill run process errored')
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
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects(thrownError)
        })

        it('calls HandleErroredBillRunService with appropriate error code', async () => {
          await ProcessBillRunService.go(billRun, [billingPeriod])

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillRunService.go(billRun, [billingPeriod])

          const args = notifierStub.omfg.firstCall.args

          expect(args[0]).to.equal('Bill run process errored')
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
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
        Sinon.stub(ChargingModuleGenerateRequest, 'send').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await ProcessBillRunService.go(billRun, [billingPeriod])

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, [billingPeriod])

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Bill run process errored')
        expect(args[1].billRun.id).to.equal(billRun.id)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal(thrownError.name)
        expect(args[2].message).to.equal(thrownError.message)
        expect(args[2].code).to.be.undefined()
      })
    })
  })
})
