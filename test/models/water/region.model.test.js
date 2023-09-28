'use strict'

// Test helpers
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const RegionModel = require('../../../app/models/water/region.model.js')

describe('Region model', () => {
  let testBillRuns
  let testLicences
  let testRecord

  beforeEach(async () => {
    testBillRuns = []
    testLicences = []

    testRecord = await RegionHelper.add()

    const { regionId } = testRecord

    for (let i = 0; i < 2; i++) {
      const billRun = await BillRunHelper.add({ regionId })
      testBillRuns.push(billRun)

      const licence = await LicenceHelper.add({ licenceRef: `0${i}/123`, regionId })
      testLicences.push(licence)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RegionModel.query().findById(testRecord.regionId)

      expect(result).toBeInstanceOf(RegionModel)
      expect(result.regionId).toBe(testRecord.regionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill runs', () => {
      it('can successfully run a related query', async () => {
        const query = await RegionModel.query()
          .innerJoinRelated('billRuns')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill runs', async () => {
        const result = await RegionModel.query()
          .findById(testRecord.regionId)
          .withGraphFetched('billRuns')

        expect(result).toBeInstanceOf(RegionModel)
        expect(result.regionId).toBe(testRecord.regionId)

        expect(result.billRuns).toBeInstanceOf(Array)
        expect(result.billRuns[0]).toBeInstanceOf(BillRunModel)
        expect(result.billRuns).toContainEqual(testBillRuns[0])
        expect(result.billRuns).toContainEqual(testBillRuns[1])
      })
    })

    describe('when linking to licences', () => {
      it('can successfully run a related query', async () => {
        const query = await RegionModel.query()
          .innerJoinRelated('licences')

        expect(query).toBeTruthy()
      })

      it('can eager load the licences', async () => {
        const result = await RegionModel.query()
          .findById(testRecord.regionId)
          .withGraphFetched('licences')

        expect(result).toBeInstanceOf(RegionModel)
        expect(result.regionId).toBe(testRecord.regionId)

        expect(result.licences).toBeInstanceOf(Array)
        expect(result.licences[0]).toBeInstanceOf(LicenceModel)
        expect(result.licences).toContainEqual(testLicences[0])
        expect(result.licences).toContainEqual(testLicences[1])
      })
    })
  })
})
