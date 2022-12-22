'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../support/helpers/billing-batch.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const RegionHelper = require('../support/helpers/region.helper.js')
const RegionModel = require('../../app/models/region.model.js')

// Thing under test
const BillingBatchModel = require('../../app/models/billing-batch.model.js')

describe('Billing Batch model', () => {
  let testBillingBatch

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testBillingBatch = await BillingBatchHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillingBatchModel.query().findById(testBillingBatch.billingBatchId)

      expect(result).to.be.an.instanceOf(BillingBatchModel)
      expect(result.billingBatchId).to.equal(testBillingBatch.billingBatchId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      let testRegion

      beforeEach(async () => {
        testRegion = await RegionHelper.add()
        testBillingBatch = await BillingBatchHelper.add({ regionId: testRegion.regionId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingBatchModel.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })

      it.only('can eager load the region', async () => {
        const result = await BillingBatchModel.query()
          .findById(testBillingBatch.billingBatchId)
          .withGraphFetched('region')

        expect(result).to.be.instanceOf(BillingBatchModel)
        expect(result.billingBatchId).to.equal(testBillingBatch.billingBatchId)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(testRegion)
      })
    })
  })
})
