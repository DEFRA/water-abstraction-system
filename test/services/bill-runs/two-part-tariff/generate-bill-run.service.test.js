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
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ExpandedErrorError = require('../../../../app/errors/expanded.error.js')

// Things we need to stub
const ChargingModuleGenerateRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-billing-accounts.service.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/two-part-tariff/process-billing-period.service.js')

// Thing under test
const GenerateBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')

describe('Generate Bill Run Service', () => {
  // NOTE: introducing a delay in the tests is not ideal. But the service is written such that the generating happens in
  // the background and is not awaited. We want to confirm things like the status of the bill run at certain points. But
  // the only way to do so is to give the background process time to complete.
  const delay = 500

  const billRunDetails = {
    batchType: 'two_part_tariff',
    fromFinancialYearEnding: 2023,
    toFinancialYearEnding: 2023
  }

  let billRun
  let notifierStub

  beforeEach(async () => {
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
        billRun = await BillRunHelper.add({ ...billRunDetails, status: 'ready' })
      })

      it('throws an error', async () => {
        const error = await expect(GenerateBillRunService.go(billRun.id)).to.reject()

        expect(error).to.be.an.instanceOf(ExpandedErrorError)
        expect(error.message).to.equal('Cannot process a two-part tariff bill run that is not in review')
      })
    })

    describe('and the bill run is in review', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ ...billRunDetails, status: 'review' })
      })

      describe('but there is nothing to bill', () => {
        it('sets the bill run status to "empty"', async () => {
          await GenerateBillRunService.go(billRun.id)

          await setTimeout(delay)

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
          await GenerateBillRunService.go(billRun.id)

          const result = await BillRunModel.query().findById(billRun.id)

          expect(result.status).to.equal('processing')
        })

        it('tells the charging module API to "generate" the bill run', async () => {
          await GenerateBillRunService.go(billRun.id)

          await setTimeout(delay)

          expect(chargingModuleGenerateRequestStub.called).to.be.true()
        })

        it('tells the legacy service to start its refresh job', async () => {
          await GenerateBillRunService.go(billRun.id)

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
      billRun = await BillRunHelper.add({ ...billRunDetails, status: 'review' })

      handleErroredBillRunStub = Sinon.stub(HandleErroredBillRunService, 'go')
    })

    describe('because fetching the billing accounts fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchBillingAccountsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService with appropriate error code', async () => {
        await GenerateBillRunService.go(billRun.id)

        await setTimeout(delay)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await GenerateBillRunService.go(billRun.id)

        await setTimeout(delay)

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
          await GenerateBillRunService.go(billRun.id)

          await setTimeout(delay)

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await GenerateBillRunService.go(billRun.id)

          await setTimeout(delay)

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
        await GenerateBillRunService.go(billRun.id)

        await setTimeout(delay)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await GenerateBillRunService.go(billRun.id)

        await setTimeout(delay)

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
