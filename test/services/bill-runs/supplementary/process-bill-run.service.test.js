'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const DatabaseSupport = require('../../../support/database.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const ChargingModuleGenerateBillRunRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const FetchBillingAccountsService = require('../../../../app/services/bill-runs/supplementary/fetch-billing-accounts.service.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
const UnflagUnbilledLicencesService = require('../../../../app/services/bill-runs/supplementary/unflag-unbilled-licences.service.js')

// Thing under test
const ProcessBillRunService = require('../../../../app/services/bill-runs/supplementary/process-bill-run.service.js')

describe('Supplementary Process Bill Run service', () => {
  const billingPeriods = _billingPeriods()

  let billRun
  let notifierStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const financialYearEnd = billingPeriods[0].endDate.getFullYear()
    billRun = await BillRunHelper.add({
      batchType: 'supplementary', fromFinancialYearEnding: financialYearEnd, toFinancialYearEnding: financialYearEnd
    })

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
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
      Sinon.stub(UnflagUnbilledLicencesService, 'go')
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(FetchBillingAccountsService, 'go').resolves([])
      })

      it('sets the bill run status to empty', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('empty')
      })
    })

    describe('and something is billed', () => {
      let chargingModuleGenerateBillRunRequestStub
      let legacyRefreshBillRunRequestStub

      beforeEach(() => {
        chargingModuleGenerateBillRunRequestStub = Sinon.stub(ChargingModuleGenerateBillRunRequest, 'send')
        legacyRefreshBillRunRequestStub = Sinon.stub(LegacyRefreshBillRunRequest, 'send')

        // NOTE: We need to resolve to something with a charge version so we have coverage of the logic that extracts
        // all licence ID's in the bill run. This is related to dealing with supplementary billing flags on licences
        Sinon.stub(FetchBillingAccountsService, 'go').resolves([{
          id: '71095f4e-5e02-496e-ac3a-3a393a6e2e48',
          chargeVersions: [{ licence: { id: '99eea281-d94c-47dd-961d-931b52da5b8a' } }]
        }])
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the Bill Run status to processing', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('processing')
      })

      it("tells the charging module API to 'generate' the bill run", async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(chargingModuleGenerateBillRunRequestStub.called).to.be.true()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(legacyRefreshBillRunRequestStub.called).to.be.true()
      })

      it('it logs the time taken', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).to.equal('Process bill run complete')
        expect(args[1].timeTakenMs).to.exist()
        expect(args[1].billRunId).to.equal(billRun.id)
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
        await ProcessBillRunService.go(billRun, billingPeriods)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

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

        it('calls HandleErroredBillRunService with the error code', async () => {
          await ProcessBillRunService.go(billRun, billingPeriods)

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillRunService.go(billRun, billingPeriods)

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
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
        Sinon.stub(UnflagUnbilledLicencesService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService without an error code', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

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

function _billingPeriods () {
  // To help help explain what is going on imagine the current billing period is 2024-04-01 to 2025-03-31
  const currentBillingPeriod = determineCurrentFinancialYear()
  // This will be set as 2025
  const currentFinancialYearEnd = currentBillingPeriod.endDate.getFullYear()

  // We instantiate what will return with the current billing period
  const billingPeriods = [currentBillingPeriod]

  // 2023 is the first financial year end for SROC (we don't cover PRESROC). So, for each year between now and then
  // create a new billing period and add it to our results
  for (let i = 0; i < currentFinancialYearEnd - 2023; i++) {
    // On the first iteration this will be 2024. On the second 2023
    const nextBillingPeriodFinancialYearEnd = currentFinancialYearEnd - (i + 1)

    // On the first iteration 2024-03-31. On the second 2023-03-31
    const endDate = new Date(nextBillingPeriodFinancialYearEnd, 2, 31)
    // On the first iteration 2023-04-01. On the second 2022-04-01
    const startDate = new Date(nextBillingPeriodFinancialYearEnd - 1, 3, 1)

    billingPeriods.push({ startDate, endDate })
  }

  return billingPeriods
}
