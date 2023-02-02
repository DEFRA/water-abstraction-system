'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const EventModel = require('../../../app/models/water/event.model.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const BillingPeriodService = require('../../../app/services/supplementary-billing/billing-period.service.js')
const ChargingModuleCreateBillRunService = require('../../../app/services/charging-module/create-bill-run.service.js')
const CheckLiveBillRunService = require('../../../app/services/supplementary-billing/check-live-bill-run.service.js')

// Thing under test
const InitiateBillingBatchService = require('../../../app//services/supplementary-billing/initiate-billing-batch.service.js')

describe('Initiate Billing Batch service', () => {
  const currentBillingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let validatedRequestData

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const region = await RegionHelper.add()
    validatedRequestData = {
      type: 'supplementary',
      scheme: 'sroc',
      region: region.regionId,
      user: 'test.user@defra.gov.uk'
    }

    Sinon.stub(BillingPeriodService, 'go').returns([currentBillingPeriod])
    Sinon.stub(CheckLiveBillRunService, 'go').resolves(false)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when initiating a billing batch succeeds', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleCreateBillRunService, 'go').resolves({
        succeeded: true,
        response: {
          id: '2bbbe459-966e-4026-b5d2-2f10867bdddd',
          billRunNumber: 10004
        }
      })
    })

    it('creates a new billing batch record', async () => {
      await InitiateBillingBatchService.go(validatedRequestData)

      const count = await BillingBatchModel.query().resultSize()

      expect(count).to.equal(1)
    })

    it('creates a new event record', async () => {
      await InitiateBillingBatchService.go(validatedRequestData)

      const count = await EventModel.query().resultSize()

      expect(count).to.equal(1)
    })

    it('returns a response', async () => {
      const result = await InitiateBillingBatchService.go(validatedRequestData)

      const billingBatch = await BillingBatchModel.query().first()

      expect(result.id).to.equal(billingBatch.billingBatchId)
      expect(result.region).to.equal(billingBatch.regionId)
      expect(result.scheme).to.equal('sroc')
      expect(result.batchType).to.equal('supplementary')
      expect(result.status).to.equal('queued')
      expect(result.errorCode).to.equal(null)
    })
  })

  describe('when initiating a billing batch fails', () => {
    describe('because a bill run could not be created in the Charging Module', () => {
      beforeEach(() => {
        Sinon.stub(ChargingModuleCreateBillRunService, 'go').resolves({
          succeeded: false,
          response: {
            statusCode: 403,
            error: 'Forbidden',
            message: "Unauthorised for regime 'wrls'"
          }
        })
      })

      it('creates a bill run with `error` status and error code 50', async () => {
        const result = await InitiateBillingBatchService.go(validatedRequestData)

        const billingBatch = await BillingBatchModel.query().first()

        expect(result.id).to.equal(billingBatch.billingBatchId)
        expect(result.region).to.equal(billingBatch.regionId)
        expect(result.scheme).to.equal('sroc')
        expect(result.batchType).to.equal('supplementary')
        expect(result.status).to.equal('error')
        expect(result.errorCode).to.equal(50)
      })
    })

    describe('because a bill run already exists for this region and financial year', () => {
      beforeEach(() => {
        CheckLiveBillRunService.go.resolves(true)
      })

      it('rejects with an appropriate error', async () => {
        const err = await expect(InitiateBillingBatchService.go(validatedRequestData)).to.reject()

        expect(err).to.be.an.error()
        expect(err.message).to.equal(`Batch already live for region ${validatedRequestData.region}`)
      })
    })
  })
})
