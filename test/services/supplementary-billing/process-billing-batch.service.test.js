'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const BillingPeriodsService = require('../../../app/services/supplementary-billing/billing-periods.service.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const InitiateBillingBatchService = require('../../../app/services/supplementary-billing/initiate-billing-batch.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')
const ProcessBillingPeriodService = require('../../../app/services/supplementary-billing/process-billing-period.service.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe.only('Process billing batch service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const regionId = '3b24cc01-19c5-4654-8ef6-24ddb4c8dcdf'
  const userEmail = 'test@wrsl.gov.uk'

  let billingBatch
  let notifierStub
  let spy

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingBatch = await BillingBatchHelper.add({ regionId })

    Sinon.stub(BillingPeriodsService, 'go').returns([billingPeriod])
    Sinon.stub(InitiateBillingBatchService, 'go').resolves(billingBatch)



    // RequestLib depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and nothing is billed', () => {
      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
        Sinon.stub(ProcessBillingPeriodService, 'go').resolves(true)
      })

      it('sets the Billing Batch status to empty', async () => {
        await ProcessBillingBatchService.go(regionId, userEmail)

        console.log('🚀 ~ file: process-billing-batch.service.test.js:68 ~ it ~ billingBatchId:', billingBatch.billingBatchId)

        const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

        expect(result.status).to.equal('empty')
      })
    })

    // it('logs the time taken to process the billing batch', async () => {
    //   await ProcessBillingPeriodService.go(billingBatch, billingPeriod)

    //   const logMessage = notifierStub.omg.firstCall.args[0]

    //   expect(logMessage).to.startWith(`Time taken to process billing batch ${billingBatch.billingBatchId}:`)
    // })
  })
})
