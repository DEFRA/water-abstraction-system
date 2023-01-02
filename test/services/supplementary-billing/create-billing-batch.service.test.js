'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchModel = require('../../../app/models/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const RegionModel = require('../../../app/models/region.model.js')

// Thing under test
const CreateBillingBatchService = require('../../../app/services/supplementary-billing/create-billing-batch.service.js')

describe('Create Billing Batch service', () => {
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  let region

  beforeEach(async () => {
    await DatabaseHelper.clean()

    region = await RegionHelper.add()
  })

  describe('when the defaults are not overridden', () => {
    it('returns the new billing batch instance containing the defaults', async () => {
      const result = await CreateBillingBatchService.go(region.regionId, billingPeriod)

      expect(result).to.be.an.instanceOf(BillingBatchModel)

      expect(result.status).to.equal('processing')
      expect(result.fromFinancialYearEnding).to.equal(2023)
      expect(result.toFinancialYearEnding).to.equal(2023)
      expect(result.batchType).to.equal('supplementary')
      expect(result.scheme).to.equal('sroc')
      expect(result.source).to.equal('wrls')

      expect(result.region).to.be.an.instanceOf(RegionModel)
      expect(result.region.regionId).to.equal(region.regionId)
    })
  })

  describe('when the defaults are overridden', () => {
    const batchType = 'annual'
    const scheme = 'wrls'
    const source = 'nald'

    it('returns the new billing batch instance containing the provided values', async () => {
      const result = await CreateBillingBatchService.go(region.regionId, billingPeriod, batchType, scheme, source)

      expect(result).to.be.an.instanceOf(BillingBatchModel)

      expect(result.status).to.equal('processing')
      expect(result.fromFinancialYearEnding).to.equal(2023)
      expect(result.toFinancialYearEnding).to.equal(2023)
      expect(result.batchType).to.equal(batchType)
      expect(result.scheme).to.equal(scheme)
      expect(result.source).to.equal(source)

      expect(result.region).to.be.an.instanceOf(RegionModel)
      expect(result.region.regionId).to.equal(region.regionId)
    })
  })
})
