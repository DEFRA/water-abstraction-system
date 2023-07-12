'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const DetermineBillingPeriodsService = require('../../../app/services/billing/determine-billing-periods.service.js')
const InitiateBillingBatchService = require('../../../app/services/billing/initiate-billing-batch.service.js')
const SupplementaryProcessBillingBatchService = require('../../../app/services/billing/supplementary/process-billing-batch.service.js')
const TwoPartTariffProcessBillingBatchService = require('../../../app/services/billing/two-part-tariff/process-billing-batch.service.js')

// Thing under test
const NewBillingBatchService = require('../../../app/services/billing/new-billing-batch.service.js')

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

  let batchType

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

    describe("and the bill batch type is 'supplementary'", () => {
      beforeEach(async () => {
        batchType = 'supplementary'

        const supplementaryBillingBatch = {
          ...billingBatch,
          batchType
        }
        Sinon.stub(InitiateBillingBatchService, 'go').resolves(supplementaryBillingBatch)

        Sinon.stub(SupplementaryProcessBillingBatchService, 'go')
      })

      it('initiates a new billing batch', async () => {
        await NewBillingBatchService.go(regionId, batchType, userEmail)

        const financialYearEndings = InitiateBillingBatchService.go.firstCall.args[0]

        expect(financialYearEndings).to.equal({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('returns a response containing details of the new billing batch', async () => {
        const result = await NewBillingBatchService.go(regionId, userEmail)

        expect(result.id).to.equal(billingBatch.billingBatchId)
        expect(result.region).to.equal(billingBatch.regionId)
        expect(result.scheme).to.equal(billingBatch.scheme)
        expect(result.batchType).to.equal(batchType)
        expect(result.status).to.equal(billingBatch.status)
        expect(result.externalId).to.equal(billingBatch.externalId)
        expect(result.errorCode).to.equal(billingBatch.errorCode)
      })

      it('starts processing the batch', async () => {
        await NewBillingBatchService.go(regionId, userEmail)

        expect(SupplementaryProcessBillingBatchService.go.called).to.be.true()
      })
    })

    describe("and the bill batch type is 'two part tariff'", () => {
      beforeEach(async () => {
        batchType = 'two_part_tariff'

        const twoPartTariffBillingBatch = {
          ...billingBatch,
          batchType
        }
        Sinon.stub(InitiateBillingBatchService, 'go').resolves(twoPartTariffBillingBatch)

        Sinon.stub(TwoPartTariffProcessBillingBatchService, 'go')
      })

      it('initiates a new billing batch', async () => {
        await NewBillingBatchService.go(regionId, userEmail)

        const financialYearEndings = InitiateBillingBatchService.go.firstCall.args[0]

        expect(financialYearEndings).to.equal({ fromFinancialYearEnding: 2023, toFinancialYearEnding: 2024 })
      })

      it('returns a response containing details of the new billing batch', async () => {
        const result = await NewBillingBatchService.go(regionId, batchType, userEmail)

        expect(result.id).to.equal(billingBatch.billingBatchId)
        expect(result.region).to.equal(billingBatch.regionId)
        expect(result.scheme).to.equal(billingBatch.scheme)
        expect(result.batchType).to.equal(batchType)
        expect(result.status).to.equal(billingBatch.status)
        expect(result.externalId).to.equal(billingBatch.externalId)
        expect(result.errorCode).to.equal(billingBatch.errorCode)
      })

      it('starts processing the batch', async () => {
        await NewBillingBatchService.go(regionId, userEmail)

        expect(TwoPartTariffProcessBillingBatchService.go.called).to.be.true()
      })
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
