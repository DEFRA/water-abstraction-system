'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchError = require('../../../app/errors/billing-batch.error.js')
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Things we need to stub
const ChargingModuleGenerateService = require('../../../app/services/charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../../app/lib/legacy-request.lib.js')
const ProcessBillingPeriodService = require('../../../app/services/supplementary-billing/process-billing-period.service.js')
const UnflagUnbilledLicencesService = require('../../../app/services/supplementary-billing/unflag-unbilled-licences.service.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe('Process billing batch service', () => {
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
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
      Sinon.stub(UnflagUnbilledLicencesService, 'go')
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
      })

      it('sets the Billing Batch status to empty', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

        expect(result.status).to.equal('empty')
      })
    })

    describe('and some charge versions are billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the Billing Batch status to processing', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

        expect(result.status).to.equal('processing')
      })

      it("tells the charging module API to 'generate' the bill run", async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        expect(chargingModuleGenerateServiceStub.called).to.be.true()
      })

      it('tells the legacy service to start its refresh job', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        expect(legacyRequestLibStub.called).to.be.true()
      })
    })

    it('logs the time taken to process the billing batch', async () => {
      await ProcessBillingBatchService.go(billingBatch, billingPeriods)

      const logMessage = notifierStub.omg.firstCall.args[0]

      expect(logMessage).to.startWith(`Time taken to process billing batch ${billingBatch.billingBatchId}:`)
    })
  })

  describe('when the service errors', () => {
    let thrownError

    describe('because fetching the charge versions fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchChargeVersionsService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillingBatchService with appropriate error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToProcessChargeVersions)
      })

      it('logs the error', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        const logDataArg = notifierStub.omfg.firstCall.args[1]

        expect(notifierStub.omfg.calledWith('Billing Batch process errored')).to.be.true()
        expect(logDataArg.billingBatch).to.equal(billingBatch)

        // We can't do a direct comparison of the error object as in other tests. This is because when `thrownError`
        // is caught in a try catch it is passed to a `new BillingBatchError()` call. That causes the stack trace to
        // be rewritten which means they'll always differ. So, we have to skip it in the comparison
        expect(logDataArg.error).to.equal({
          name: thrownError.name,
          message: `Error: ${thrownError.message}`,
          code: BillingBatchModel.errorCodes.failedToProcessChargeVersions
        },
        { skip: 'stack' }
        )
      })
    })

    describe('because the process billing period service fails', () => {
      describe('and the error thrown has an error code', () => {
        beforeEach(() => {
          thrownError = new BillingBatchError(new Error(), BillingBatchModel.errorCodes.failedToPrepareTransactions)

          Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects(thrownError)
        })

        it('calls HandleErroredBillingBatchService with the error code', async () => {
          await ProcessBillingBatchService.go(billingBatch, billingPeriods)

          const handlerArgs = handleErroredBillingBatchStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToPrepareTransactions)
        })

        it('logs the error', async () => {
          await ProcessBillingBatchService.go(billingBatch, billingPeriods)

          const logDataArg = notifierStub.omfg.firstCall.args[1]

          expect(notifierStub.omfg.calledWith('Billing Batch process errored')).to.be.true()
          expect(logDataArg.billingBatch).to.equal(billingBatch)
          expect(logDataArg.error).to.equal({
            name: thrownError.name,
            message: thrownError.message,
            stack: thrownError.stack,
            code: BillingBatchModel.errorCodes.failedToPrepareTransactions
          })
        })
      })
    })

    describe('because finalising the bill run fails', () => {
      beforeEach(() => {
        thrownError = new Error('ERROR')

        Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
        Sinon.stub(UnflagUnbilledLicencesService, 'go').rejects(thrownError)
      })

      it('calls HandleErroredBillingBatchService without an error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.be.undefined()
      })

      it('logs the error', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriods)

        const logDataArg = notifierStub.omfg.firstCall.args[1]

        expect(notifierStub.omfg.calledWith('Billing Batch process errored')).to.be.true()
        expect(logDataArg.billingBatch).to.equal(billingBatch)
        expect(logDataArg.error).to.equal({
          name: thrownError.name,
          message: thrownError.message,
          stack: thrownError.stack,
          code: undefined
        })
      })
    })
  })
})
