'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const RegionModel = require('../../../app/models/water/region.model.js')

// Thing under test
const BillRunModel = require('../../../app/models/water/bill-run.model.js')

describe('Bill Run model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillRunHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillRunModel.query().findById(testRecord.billingBatchId)

      expect(result).to.be.an.instanceOf(BillRunModel)
      expect(result.billingBatchId).to.equal(testRecord.billingBatchId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      let testRegion

      beforeEach(async () => {
        testRegion = await RegionHelper.add()
        testRecord = await BillRunHelper.add({ regionId: testRegion.regionId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await BillRunModel.query()
          .findById(testRecord.billingBatchId)
          .withGraphFetched('region')

        expect(result).to.be.instanceOf(BillRunModel)
        expect(result.billingBatchId).to.equal(testRecord.billingBatchId)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(testRegion)
      })
    })

    describe('when linking to bills', () => {
      let testBills

      beforeEach(async () => {
        testRecord = await BillRunHelper.add()
        const { billingBatchId } = testRecord

        testBills = []
        for (let i = 0; i < 2; i++) {
          const bill = await BillHelper.add({ financialYearEnding: 2023, billingBatchId })
          testBills.push(bill)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query()
          .innerJoinRelated('bills')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await BillRunModel.query()
          .findById(testRecord.billingBatchId)
          .withGraphFetched('bills')

        expect(result).to.be.instanceOf(BillRunModel)
        expect(result.billingBatchId).to.equal(testRecord.billingBatchId)

        expect(result.bills).to.be.an.array()
        expect(result.bills[0]).to.be.an.instanceOf(BillModel)
        expect(result.bills).to.include(testBills[0])
        expect(result.bills).to.include(testBills[1])
      })
    })
  })

  describe('Static getters', () => {
    describe('Error codes', () => {
      it('returns the requested error code', async () => {
        const result = BillRunModel.errorCodes.failedToCreateBillRun

        expect(result).to.equal(50)
      })
    })
  })
})
