'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { setTimeout } = require('timers/promises')

const BillRunError = require('../../../../app/errors/bill-run.error.js')
const ExpandedErrorError = require('../../../../app/errors/expanded.error.js')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleGenerateRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-billing-accounts.service.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/two-part-tariff/process-billing-period.service.js')

// Thing under test
const GenerateBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')

describe('Bill Runs - Two Part Tariff - Generate Bill Run Service', () => {
  // NOTE: introducing a delay in the tests is not ideal. But the service is written such that the generating happens in
  // the background and is not awaited. We want to confirm things like the status of the bill run at certain points. But
  // the only way to do so is to give the background process time to complete.
  const delay = 500

  const billRunDetails = {
    batchType: 'two_part_tariff',
    fromFinancialYearEnding: 2023,
    id: '8aaaf207-fd0e-4a10-9ac6-b89f68250e0f',
    status: 'review',
    toFinancialYearEnding: 2023
  }

  let billRunPatchStub
  let billRunSelectStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = Sinon.stub().resolves()
    billRunSelectStub = Sinon.stub()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      patch: billRunPatchStub,
      select: billRunSelectStub
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

  describe('when called', () => {
    beforeEach(() => {
      // We stub FetchBillingAccountsService to return no results in all scenarios because it is the result of
      // ProcessBillingPeriodService which determines if there is anything to bill. We change the stub of that service
      // to dictate the scenario we're trying to test.
      Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
    })

    describe('and the bill run is not in review', () => {
      beforeEach(async () => {
        billRunSelectStub.resolves({ ...billRunDetails, status: 'ready' })
      })

      it('throws an error', async () => {
        const error = await expect(GenerateBillRunService.go(billRunDetails.id)).to.reject()

        expect(error).to.be.an.instanceOf(ExpandedErrorError)
        expect(error.message).to.equal('Cannot process a two-part tariff annual bill run that is not in review')
      })
    })

    describe('and the bill run is in review', () => {
      describe('but it is not a two-part tariff annual', () => {
        beforeEach(async () => {
          billRunSelectStub.resolves({ ...billRunDetails, batchType: 'two_part_supplementary' })
        })

        it('throws an error', async () => {
          const error = await expect(GenerateBillRunService.go(billRunDetails.id)).to.reject()

          expect(error).to.be.an.instanceOf(ExpandedErrorError)
          expect(error.message).to.equal('This end point only supports two-part tariff annual')
        })
      })

      describe('but there is nothing to bill', () => {
        beforeEach(async () => {
          billRunSelectStub.resolves({ ...billRunDetails })
        })

        it('sets the bill run status first to "processing" and then to "empty"', async () => {
          await GenerateBillRunService.go(billRunDetails.id)

          await setTimeout(delay)

          expect(billRunPatchStub.calledTwice).to.be.true()
          expect(billRunPatchStub.firstCall.firstArg).to.equal({ status: 'processing' }, { skip: ['updatedAt'] })
          expect(billRunPatchStub.secondCall.firstArg).to.equal({ status: 'empty' }, { skip: ['updatedAt'] })
        })
      })

      describe('and something is billed', () => {
        let chargingModuleGenerateRequestStub
        let legacyRefreshBillRunRequestStub

        beforeEach(() => {
          billRunSelectStub.resolves({ ...billRunDetails })

          chargingModuleGenerateRequestStub = Sinon.stub(ChargingModuleGenerateRequest, 'send')
          legacyRefreshBillRunRequestStub = Sinon.stub(LegacyRefreshBillRunRequest, 'send')

          Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
        })

        it('sets the bill run status to "processing"', async () => {
          await GenerateBillRunService.go(billRunDetails.id)

          expect(billRunPatchStub.calledOnce).to.be.true()
          expect(billRunPatchStub.firstCall.firstArg).to.equal({ status: 'processing' }, { skip: ['updatedAt'] })
        })

        it('tells the charging module API to "generate" the bill run', async () => {
          await GenerateBillRunService.go(billRunDetails.id)

          await setTimeout(delay)

          expect(chargingModuleGenerateRequestStub.called).to.be.true()
        })

        it('tells the legacy service to start its refresh job', async () => {
          await GenerateBillRunService.go(billRunDetails.id)

          await setTimeout(delay)

          expect(legacyRefreshBillRunRequestStub.called).to.be.true()
        })
      })
    })
  })

  describe('when the service errors', () => {
    let handleErroredBillRunStub
    let thrownError

    beforeEach(async () => {
      billRunSelectStub.resolves({ ...billRunDetails })

      handleErroredBillRunStub = Sinon.stub(HandleErroredBillRunService, 'go')
    })

    describe('because fetching the billing accounts fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchBillingAccountsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await GenerateBillRunService.go(billRunDetails.id)

        await setTimeout(delay)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await GenerateBillRunService.go(billRunDetails.id)

        await setTimeout(delay)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Bill run process errored')
        expect(args[1].billRun.id).to.equal(billRunDetails.id)
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
          await GenerateBillRunService.go(billRunDetails.id)

          await setTimeout(delay)

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await GenerateBillRunService.go(billRunDetails.id)

          await setTimeout(delay)

          const args = notifierStub.omfg.firstCall.args

          expect(args[0]).to.equal('Bill run process errored')
          expect(args[1].billRun.id).to.equal(billRunDetails.id)
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
        await GenerateBillRunService.go(billRunDetails.id)

        await setTimeout(delay)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await GenerateBillRunService.go(billRunDetails.id)

        await setTimeout(delay)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Bill run process errored')
        expect(args[1].billRun.id).to.equal(billRunDetails.id)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal(thrownError.name)
        expect(args[2].message).to.equal(thrownError.message)
        expect(args[2].code).to.be.undefined()
      })
    })
  })
})
