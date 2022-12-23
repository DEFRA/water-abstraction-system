'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../support/helpers/billing-batch.helper.js')
const BillingBatchModel = require('../../app/models/billing-batch.model.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')

// Thing under test
const RegionModel = require('../../app/models/region.model.js')

describe('Region model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await RegionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RegionModel.query().findById(testRecord.regionId)

      expect(result).to.be.an.instanceOf(RegionModel)
      expect(result.regionId).to.equal(testRecord.regionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing batches', () => {
      let testBillingBatches

      beforeEach(async () => {
        const { regionId } = testRecord

        testBillingBatches = []
        for (let i = 0; i < 2; i++) {
          const billingBatch = await BillingBatchHelper.add({ regionId })
          testBillingBatches.push(billingBatch)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await RegionModel.query()
          .innerJoinRelated('billingBatches')

        expect(query).to.exist()
      })

      it('can eager load the billing batches', async () => {
        const result = await RegionModel.query()
          .findById(testRecord.regionId)
          .withGraphFetched('billingBatches')

        expect(result).to.be.instanceOf(RegionModel)
        expect(result.regionId).to.equal(testRecord.regionId)

        expect(result.billingBatches).to.be.an.array()
        expect(result.billingBatches[0]).to.be.an.instanceOf(BillingBatchModel)
        expect(result.billingBatches).to.include(testBillingBatches[0])
        expect(result.billingBatches).to.include(testBillingBatches[1])
      })
    })

    describe('when linking to licences', () => {
      let testLicences

      beforeEach(async () => {
        const { regionId } = testRecord

        testLicences = []
        for (let i = 0; i < 2; i++) {
          const licence = await LicenceHelper.add({ licenceRef: `0${i}/123`, regionId })
          testLicences.push(licence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await RegionModel.query()
          .innerJoinRelated('licences')

        expect(query).to.exist()
      })

      it('can eager load the licences', async () => {
        const result = await RegionModel.query()
          .findById(testRecord.regionId)
          .withGraphFetched('licences')

        expect(result).to.be.instanceOf(RegionModel)
        expect(result.regionId).to.equal(testRecord.regionId)

        expect(result.licences).to.be.an.array()
        expect(result.licences[0]).to.be.an.instanceOf(LicenceModel)
        expect(result.licences).to.include(testLicences[0])
        expect(result.licences).to.include(testLicences[1])
      })
    })
  })
})
