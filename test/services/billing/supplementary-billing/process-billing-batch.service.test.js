'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchError = require('../../../../app/errors/billing-batch.error.js')
const BillingBatchHelper = require('../../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Things we need to stub
const ChargingModuleGenerateService = require('../../../../app/services/charging-module/generate-bill-run.service.js')
const FeatureFlagsConfig = require('../../../../config/feature-flags.config.js')
const FetchChargeVersionsService = require('../../../../app/services/billing/supplementary/fetch-charge-versions.service.js')
const HandleErroredBillingBatchService = require('../../../../app/services/billing/supplementary/handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../../../app/lib/legacy-request.lib.js')
const ProcessBillingPeriodService = require('../../../../app/services/billing/supplementary/process-billing-period.service.js')
const ReissueInvoicesService = require('../../../../app/services/billing/supplementary/reissue-invoices.service.js')
const UnflagUnbilledLicencesService = require('../../../../app/services/billing/supplementary/unflag-unbilled-licences.service.js')

// Thing under test
const SupplementaryProcessBillingBatchService = require('../../../../app/services/billing/supplementary/process-billing-batch.service.js')

describe('Supplementary Process billing batch service', () => {
  const billingPeriods = [
    { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
    { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  ]

  let billingBatch
  let chargingModuleGenerateServiceStub
  let handleErroredBillingBatchStub
  let legacyRequestLibStub
  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingBatch = await BillingBatchHelper.add()

    handleErroredBillingBatchStub = Sinon.stub(HandleErroredBillingBatchService, 'go')
    chargingModuleGenerateServiceStub = Sinon.stub(ChargingModuleGenerateService, 'go')
    legacyRequestLibStub = Sinon.stub(LegacyRequestLib, 'post')

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

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
      Sinon.stub(UnflagUnbilledLicencesService, 'go')
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
      })

      describe('and there are no invoices to reissue', () => {
        beforeEach(() => {
          Sinon.stub(ReissueInvoicesService, 'go').resolves(false)
        })

        it('sets the Billing Batch status to empty', async () => {
          await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

          const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

          expect(result.status).to.equal('empty')
        })
      })

      describe('and there are invoices to reissue', () => {
        beforeEach(() => {
          Sinon.stub(ReissueInvoicesService, 'go').resolves(true)
        })

        it('sets the Billing Batch status to processing', async () => {
          await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

          const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

          expect(result.status).to.equal('processing')
        })
      })
    })

    describe('and some charge versions are billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
        Sinon.stub(ReissueInvoicesService, 'go').resolves(true)
      })

      it('sets the Billing Batch status to processing', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

        expect(result.status).to.equal('processing')
      })

      it("tells the charging module API to 'generate' the bill run", async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        expect(chargingModuleGenerateServiceStub.called).to.be.true()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        expect(legacyRequestLibStub.called).to.be.true()
      })

      it('it logs the time taken', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).to.equal('Process billing batch complete')
        expect(args[1].timeTakenMs).to.exist()
        expect(args[1].billingBatchId).to.equal(billingBatch.billingBatchId)
      })
    })
  })

  describe('when the service errors', () => {
    let thrownError

    beforeEach(() => {
      Sinon.stub(ReissueInvoicesService, 'go')
    })

    describe('because fetching the charge versions fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchChargeVersionsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillingBatchService with appropriate error code', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Billing Batch process errored')
        expect(args[1].billingBatch.billingBatchId).to.equal(billingBatch.billingBatchId)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal(thrownError.name)
        expect(args[2].message).to.equal(`Error: ${thrownError.message}`)
        expect(args[2].code).to.equal(BillingBatchModel.errorCodes.failedToProcessChargeVersions)
      })
    })

    describe('because the process billing period service fails', () => {
      describe('and the error thrown has an error code', () => {
        beforeEach(() => {
          thrownError = new BillingBatchError(new Error(), BillingBatchModel.errorCodes.failedToPrepareTransactions)

          Sinon.stub(FetchChargeVersionsService, 'go').resolves({ chargeVersions: [], licenceIdsForPeriod: [] })
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects(thrownError)
        })

        it('calls HandleErroredBillingBatchService with the error code', async () => {
          await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

          const handlerArgs = handleErroredBillingBatchStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

          const args = notifierStub.omfg.firstCall.args

          expect(args[0]).to.equal('Billing Batch process errored')
          expect(args[1].billingBatch.billingBatchId).to.equal(billingBatch.billingBatchId)
          expect(args[2]).to.be.an.error()
          expect(args[2].name).to.equal(thrownError.name)
          expect(args[2].message).to.equal(thrownError.message)
          expect(args[2].code).to.equal(BillingBatchModel.errorCodes.failedToPrepareTransactions)
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

      it('calls HandleErroredBillingBatchService without an error code', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await SupplementaryProcessBillingBatchService.go(billingBatch, billingPeriods)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Billing Batch process errored')
        expect(args[1].billingBatch.billingBatchId).to.equal(billingBatch.billingBatchId)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal(thrownError.name)
        expect(args[2].message).to.equal(thrownError.message)
        expect(args[2].code).to.be.undefined()
      })
    })
  })
})
