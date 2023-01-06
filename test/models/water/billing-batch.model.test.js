'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const RegionModel = require('../../../app/models/water/region.model.js')

// Thing under test
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')

describe('Billing Batch model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillingBatchHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillingBatchModel.query().findById(testRecord.billingBatchId)

      expect(result).to.be.an.instanceOf(BillingBatchModel)
      expect(result.billingBatchId).to.equal(testRecord.billingBatchId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      let testRegion

      beforeEach(async () => {
        testRegion = await RegionHelper.add()
        testRecord = await BillingBatchHelper.add({ regionId: testRegion.regionId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingBatchModel.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await BillingBatchModel.query()
          .findById(testRecord.billingBatchId)
          .withGraphFetched('region')

        expect(result).to.be.instanceOf(BillingBatchModel)
        expect(result.billingBatchId).to.equal(testRecord.billingBatchId)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(testRegion)
      })
    })
  })
})
