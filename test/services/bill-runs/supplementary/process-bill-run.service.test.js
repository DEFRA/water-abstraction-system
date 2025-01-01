'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Things we need to stub
const ChargingModuleGenerateBillRunRequest = require('../../../../app/requests/charging-module/generate-bill-run.request.js')
const { closeConnection } = require('../../../support/database.js')
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const FetchChargeVersionsService = require('../../../../app/services/bill-runs/supplementary/fetch-charge-versions.service.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const LegacyRefreshBillRunRequest = require('../../../../app/requests/legacy/refresh-bill-run.request.js')
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/supplementary/process-billing-period.service.js')
const UnflagUnbilledLicencesService = require('../../../../app/services/bill-runs/supplementary/unflag-unbilled-licences.service.js')

// Thing under test
const SupplementaryProcessBillRunService = require('../../../../app/services/bill-runs/supplementary/process-bill-run.service.js')

describe('Supplementary Process Bill Run service', () => {
  const billingPeriods = [
    { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
    { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  ]

  let billRun
  let chargingModuleGenerateBillRunRequestStub
  let handleErroredBillRunStub
  let legacyRefreshBillRunRequestStub
  let notifierStub

  beforeEach(async () => {
    billRun = await BillRunHelper.add()

    handleErroredBillRunStub = Sinon.stub(HandleErroredBillRunService, 'go')
    chargingModuleGenerateBillRunRequestStub = Sinon.stub(ChargingModuleGenerateBillRunRequest, 'send')
    legacyRefreshBillRunRequestStub = Sinon.stub(LegacyRefreshBillRunRequest, 'send')

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    // We set the `enableReissuingBillingBatches` feature flag to `true` to ensure that we always perform reissuing
    Sinon.replace(FeatureFlagsConfig, 'enableReissuingBillingBatches', true)
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  after(async () => {
    await closeConnection()
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
      Sinon.stub(UnflagUnbilledLicencesService, 'go')
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
      })

      it('sets the Bill Run status to empty', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('empty')
      })
    })

    describe('and some charge versions are billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the Bill Run status to processing', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('processing')
      })

      it('tells the charging module API to "generate" the bill run', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        expect(chargingModuleGenerateBillRunRequestStub.called).to.be.true()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        expect(legacyRefreshBillRunRequestStub.called).to.be.true()
      })

      it('it logs the time taken', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).to.equal('Process bill run complete')
        expect(args[1].timeTakenMs).to.exist()
        expect(args[1].billRunId).to.equal(billRun.id)
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
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

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

          Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects(thrownError)
        })

        it('calls HandleErroredBillRunService with the error code', async () => {
          await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

          const handlerArgs = handleErroredBillRunStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

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

        Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
        Sinon.stub(UnflagUnbilledLicencesService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillRunService without an error code', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

        const handlerArgs = handleErroredBillRunStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await SupplementaryProcessBillRunService.go(billRun, billingPeriods)

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
