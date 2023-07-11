'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchModel = require('../../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const EventModel = require('../../../../app/models/water/event.model.js')
const RegionHelper = require('../../../support/helpers/water/region.helper.js')

// Things we need to stub
const ChargingModuleCreateBillRunService = require('../../../../app/services/charging-module/create-bill-run.service.js')
const CheckLiveBillRunService = require('../../../../app/services/billing/check-live-bill-run.service.js')
const ProcessBillingBatchService = require('../../../../app/services/billing/supplementary/process-billing-batch.service.js')

// Thing under test
const InitiateBillingBatchService = require('../../../../app/services/billing/supplementary/initiate-billing-batch.service.js')

describe('Initiate Billing Batch service', () => {
  const financialYearEndings = { fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 }
  const user = 'test.user@defra.gov.uk'
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const region = await RegionHelper.add()
    regionId = region.regionId

    Sinon.stub(CheckLiveBillRunService, 'go').resolves(false)

    // The InitiateBillingBatch service does not await the call to the ProcessBillingBatchService. It is intended to
    // kick of the process and then move on. This is why we simply stub it in the tests.
    Sinon.stub(ProcessBillingBatchService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when initiating a billing batch succeeds', () => {
    const responseBody = {
      billRun: {
        id: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
        billRunNumber: 10004
      }
    }

    beforeEach(() => {
      Sinon.stub(ChargingModuleCreateBillRunService, 'go').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 200,
          body: responseBody
        }
      })
    })

    it('creates a new billing batch record', async () => {
      await InitiateBillingBatchService.go(financialYearEndings, regionId, user)

      const result = await BillingBatchModel.query().limit(1).first()

      expect(result.externalId).to.equal(responseBody.billRun.id)
      expect(result.billRunNumber).to.equal(responseBody.billRun.billRunNumber)
    })

    it('creates a new event record', async () => {
      await InitiateBillingBatchService.go(financialYearEndings, regionId, user)

      const count = await EventModel.query().resultSize()

      expect(count).to.equal(1)
    })

    it('returns the new billing batch', async () => {
      const result = await InitiateBillingBatchService.go(financialYearEndings, regionId, user)

      const billingBatch = await BillingBatchModel.query().first()

      expect(result.billingBatchId).to.equal(billingBatch.billingBatchId)
      expect(result.regionId).to.equal(billingBatch.regionId)
      expect(result.scheme).to.equal('sroc')
      expect(result.batchType).to.equal('supplementary')
      expect(result.status).to.equal('queued')
      expect(result.errorCode).to.be.null()
    })
  })

  describe('when initiating a billing batch fails', () => {
    describe('because a bill run could not be created in the Charging Module', () => {
      beforeEach(() => {
        Sinon.stub(ChargingModuleCreateBillRunService, 'go').resolves({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
            },
            statusCode: 403,
            body: {
              statusCode: 403,
              error: 'Forbidden',
              message: "Unauthorised for regime 'wrls'"
            }
          }
        })
      })

      it('creates a bill run with `error` status and error code 50', async () => {
        const result = await InitiateBillingBatchService.go(financialYearEndings, regionId, user)

        const billingBatch = await BillingBatchModel.query().limit(1).first()

        expect(result.billingBatchId).to.equal(billingBatch.billingBatchId)
        expect(result.regionId).to.equal(billingBatch.regionId)
        expect(result.scheme).to.equal('sroc')
        expect(result.batchType).to.equal('supplementary')
        expect(result.status).to.equal('error')
        expect(result.errorCode).to.equal(50)
      })
    })

    describe('because a bill run already exists for this region, financial year and type', () => {
      beforeEach(() => {
        CheckLiveBillRunService.go.resolves(true)
      })

      it('rejects with an appropriate error', async () => {
        const err = await expect(InitiateBillingBatchService.go(financialYearEndings, regionId, user)).to.reject()

        expect(err).to.be.an.error()
        expect(err.message).to.equal('Batch already live for region')
        expect(err.regionId).to.equal(regionId)
      })
    })
  })
})
