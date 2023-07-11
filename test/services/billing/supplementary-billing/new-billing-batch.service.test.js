'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const DetermineBillingPeriodsService = require('../../../../app/services/billing/determine-billing-periods.service.js')
const InitiateBillingBatchService = require('../../../../app/services/billing/initiate-billing-batch.service.js')
const ProcessBillingBatchService = require('../../../../app/services/billing/supplementary/process-billing-batch.service.js')

// Thing under test
const NewBillingBatchService = require('../../../../app/services/billing/supplementary/new-billing-batch.service.js')

describe('New billing batch service', () => {
  const regionId = '3b24cc01-19c5-4654-8ef6-24ddb4c8dcdf'
  const userEmail = 'test@wrsl.gov.uk'

  const billingBatch = {
    billingBatchId: 'e3bc5bb1-a223-43a2-b73f-10e6c4ed9626',
    regionId,
    scheme: 'sroc',
    batchType: 'supplementary',
    status: 'queued',
    externalId: '8c8448a6-f0ea-44a7-b41e-aafe79cb02f8',
    errorCode: null
  }

  let initiateBillingBatchStub
  let processBillingBatchStub

  beforeEach(async () => {
    initiateBillingBatchStub = Sinon.stub(InitiateBillingBatchService, 'go').resolves(billingBatch)
    processBillingBatchStub = Sinon.stub(ProcessBillingBatchService, 'go')
  })

  afterEach(async () => {
    Sinon.restore()
  })

  describe('when the service succeeds', () => {
    beforeEach(async () => {
      const billingPeriods = [
        { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
        { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
      ]

      Sinon.stub(DetermineBillingPeriodsService, 'go').returns(billingPeriods)
    })

    it('initiates a new billing batch', async () => {
      await NewBillingBatchService.go(regionId, userEmail)

      const financialYearEndings = initiateBillingBatchStub.firstCall.args[0]

      expect(financialYearEndings).to.equal({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
    })

    it('starts processing the batch', async () => {
      await NewBillingBatchService.go(regionId, userEmail)

      expect(processBillingBatchStub.called).to.be.true()
    })

    it('returns a response containing details of the new billing batch', async () => {
      const result = await NewBillingBatchService.go(regionId, userEmail)

      expect(result.id).to.equal(billingBatch.billingBatchId)
      expect(result.region).to.equal(billingBatch.regionId)
      expect(result.scheme).to.equal(billingBatch.scheme)
      expect(result.batchType).to.equal(billingBatch.batchType)
      expect(result.status).to.equal(billingBatch.status)
      expect(result.externalId).to.equal(billingBatch.externalId)
      expect(result.errorCode).to.equal(billingBatch.errorCode)
    })
  })

  describe('when calling the service fails', () => {
    beforeEach(() => {
      Sinon.stub(DetermineBillingPeriodsService, 'go').throws()
    })

    it('throws an error', async () => {
      await expect(NewBillingBatchService.go(regionId, userEmail)).to.reject()
    })
  })
})
