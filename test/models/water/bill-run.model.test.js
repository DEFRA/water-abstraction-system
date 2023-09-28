'use strict'

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const RegionModel = require('../../../app/models/water/region.model.js')

// Thing under test
const BillRunModel = require('../../../app/models/water/bill-run.model.js')

describe('Bill Run model', () => {
  let testBills
  let testRecord
  let testRegion

  beforeAll(async () => {
    testBills = []
    testRegion = await RegionHelper.add()
    testRecord = await BillRunHelper.add({ regionId: testRegion.regionId })

    const { billingBatchId } = testRecord

    for (let i = 0; i < 2; i++) {
      const bill = await BillHelper.add({ financialYearEnding: 2023, billingBatchId })
      testBills.push(bill)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunModel.query().findById(testRecord.billingBatchId)

      expect(result).toBeInstanceOf(BillRunModel)
      expect(result.billingBatchId).toBe(testRecord.billingBatchId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query()
          .innerJoinRelated('region')

        expect(query).toBeTruthy()
      })

      it('can eager load the region', async () => {
        const result = await BillRunModel.query()
          .findById(testRecord.billingBatchId)
          .withGraphFetched('region')

        expect(result).toBeInstanceOf(BillRunModel)
        expect(result.billingBatchId).toBe(testRecord.billingBatchId)

        expect(result.region).toBeInstanceOf(RegionModel)
        expect(result.region).toEqual(testRegion)
      })
    })

    describe('when linking to bills', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query()
          .innerJoinRelated('bills')

        expect(query).toBeTruthy()
      })

      it('can eager load the bills', async () => {
        const result = await BillRunModel.query()
          .findById(testRecord.billingBatchId)
          .withGraphFetched('bills')

        expect(result).toBeInstanceOf(BillRunModel)
        expect(result.billingBatchId).toBe(testRecord.billingBatchId)

        expect(result.bills).toBeInstanceOf(Array)
        expect(result.bills[0]).toBeInstanceOf(BillModel)
        expect(result.bills).toContainEqual(testBills[0])
        expect(result.bills).toContainEqual(testBills[1])
      })
    })
  })

  describe('Static getters', () => {
    describe('Error codes', () => {
      it('returns the requested error code', async () => {
        const result = BillRunModel.errorCodes.failedToCreateBillRun

        expect(result).toEqual(50)
      })
    })
  })
})
