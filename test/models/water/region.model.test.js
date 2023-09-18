'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const RegionModel = require('../../../app/models/water/region.model.js')

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
    describe('when linking to bill runs', () => {
      let testBillRuns

      beforeEach(async () => {
        const { regionId } = testRecord

        testBillRuns = []
        for (let i = 0; i < 2; i++) {
          const billRun = await BillRunHelper.add({ regionId })
          testBillRuns.push(billRun)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await RegionModel.query()
          .innerJoinRelated('billRuns')

        expect(query).to.exist()
      })

      it('can eager load the bill runs', async () => {
        const result = await RegionModel.query()
          .findById(testRecord.regionId)
          .withGraphFetched('billRuns')

        expect(result).to.be.instanceOf(RegionModel)
        expect(result.regionId).to.equal(testRecord.regionId)

        expect(result.billRuns).to.be.an.array()
        expect(result.billRuns[0]).to.be.an.instanceOf(BillRunModel)
        expect(result.billRuns).to.include(testBillRuns[0])
        expect(result.billRuns).to.include(testBillRuns[1])
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
