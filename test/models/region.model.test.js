'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')

// Thing under test
const RegionModel = require('../../app/models/region.model.js')

describe('Region model', () => {
  let testRecord

  beforeEach(() => {
    testRecord = RegionHelper.select()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RegionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(RegionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill runs', () => {
      let testBillRuns

      beforeEach(async () => {
        const { id } = testRecord

        testBillRuns = []
        for (let i = 0; i < 2; i++) {
          const billRun = await BillRunHelper.add({ regionId: id })

          testBillRuns.push(billRun)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await RegionModel.query().innerJoinRelated('billRuns')

        expect(query).to.exist()
      })

      it('can eager load the bill runs', async () => {
        const result = await RegionModel.query().findById(testRecord.id).withGraphFetched('billRuns')

        expect(result).to.be.instanceOf(RegionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRuns).to.be.an.array()
        expect(result.billRuns[0]).to.be.an.instanceOf(BillRunModel)
        expect(result.billRuns).to.include(testBillRuns[0])
        expect(result.billRuns).to.include(testBillRuns[1])
      })
    })

    describe('when linking to licences', () => {
      let testLicences

      beforeEach(async () => {
        const { id } = testRecord

        testLicences = []
        for (let i = 0; i < 2; i++) {
          const licence = await LicenceHelper.add({ licenceRef: LicenceHelper.generateLicenceRef(), regionId: id })

          testLicences.push(licence)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await RegionModel.query().innerJoinRelated('licences')

        expect(query).to.exist()
      })

      it('can eager load the licences', async () => {
        const result = await RegionModel.query().findById(testRecord.id).withGraphFetched('licences')

        expect(result).to.be.instanceOf(RegionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licences).to.be.an.array()
        expect(result.licences[0]).to.be.an.instanceOf(LicenceModel)
        expect(result.licences).to.include(testLicences[0])
        expect(result.licences).to.include(testLicences[1])
      })
    })
  })
})
