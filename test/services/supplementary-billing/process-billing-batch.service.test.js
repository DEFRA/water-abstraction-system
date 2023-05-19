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
const BillingPeriodsService = require('../../../app/services/supplementary-billing/billing-periods.service.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const InitiateBillingBatchService = require('../../../app/services/supplementary-billing/initiate-billing-batch.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')
const ProcessBillingPeriodService = require('../../../app/services/supplementary-billing/process-billing-period.service.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe.skip('Process billing batch service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const regionId = '3b24cc01-19c5-4654-8ef6-24ddb4c8dcdf'
  const userEmail = 'test@wrsl.gov.uk'

  let billingBatch
  let handleErroredBillingBatchStub
  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingBatch = await BillingBatchHelper.add({ regionId })

    Sinon.stub(BillingPeriodsService, 'go').returns([billingPeriod])
    Sinon.stub(InitiateBillingBatchService, 'go').resolves(billingBatch)

    handleErroredBillingBatchStub = Sinon.stub(HandleErroredBillingBatchService, 'go')

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
    })

    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the Billing Batch status to empty', async () => {
        await ProcessBillingBatchService.go(regionId, userEmail)

        setTimeout(async () => {
          const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

          expect(result.status).to.equal('empty')
        }, 2000)
      })
    })

    describe('and some charge versions are billed', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(false)
      })

      it('sets the Billing Batch status to processing', async () => {
        await ProcessBillingBatchService.go(regionId, userEmail)

        setTimeout(async () => {
          const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

          expect(result.status).to.equal('processing')
        }, 2000)
      })
    })

    it('logs the time taken to process the billing batch', async () => {
      await ProcessBillingBatchService.go(regionId, userEmail)

      setTimeout(async () => {
        const logMessage = notifierStub.omg.firstCall.args[0]

        expect(logMessage).to.startWith(`Time taken to process billing batch ${billingBatch.billingBatchId}:`)
      }, 2000)
    })
  })

  describe('when the service errors', () => {
    describe('because fetching the charge versions fails', () => {
      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').rejects()
      })

      it('sets the appropriate error code', async () => {
        await ProcessBillingBatchService.go(regionId, userEmail)

        setTimeout(async () => {
          console.log('loo')
          const handlerArgs = handleErroredBillingBatchStub.firstCall.args

          expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToProcessChargeVersions)
        }, 2000)
      })
    })

    describe('because the process billing period service fails', () => {
      describe('and the error thrown has an error code', () => {
        beforeEach(() => {
          // const error = new BillingBatchError(new Error(), BillingBatchModel.errorCodes.failedToPrepareTransactions)
          Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
          Sinon.stub(ProcessBillingPeriodService, 'go').rejects()
        })

        it('sets the appropriate error code', async () => {
          console.log('BOO')
          await expect(ProcessBillingPeriodService.go(billingBatch, billingPeriod)).to.reject()
          console.log('HOO')

          setTimeout(async () => {
            const handlerArgs = handleErroredBillingBatchStub.firstCall.args
            console.log('loo')
            expect(handlerArgs[1]).to.equal(1000)

            // expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToProcessChargeVersions)
          }, 2000)
        })
      })
    })
  })
})
