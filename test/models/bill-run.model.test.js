'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../support/helpers/bill.helper.js')
const BillModel = require('../../app/models/bill.model.js')
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunVolumeHelper = require('../support/helpers/bill-run-volume.helper.js')
const BillRunVolumeModel = require('../../app/models/bill-run-volume.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')
const RegionModel = require('../../app/models/region.model.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')

// Thing under test
const BillRunModel = require('../../app/models/bill-run.model.js')

describe('Bill Run model', () => {
  let testBillRunVolumes
  let testBills
  let testRecord
  let testRegion
  let testReviewLicences

  before(async () => {
    // Link to region
    testRegion = RegionHelper.select()
    const { id: regionId } = testRegion

    // Test record
    testRecord = await BillRunHelper.add({ regionId })
    const { id } = testRecord

    // Link to bills
    testBills = []
    for (let i = 0; i < 2; i++) {
      const bill = await BillHelper.add({ financialYearEnding: 2023, billRunId: id })

      testBills.push(bill)
    }

    // Link to bill run volumes
    testBillRunVolumes = []
    for (let i = 0; i < 2; i++) {
      const billRunVolume = await BillRunVolumeHelper.add({ billRunId: id })

      testBillRunVolumes.push(billRunVolume)
    }

    // Link to review licences
    testReviewLicences = []
    for (let i = 0; i < 2; i++) {
      const reviewLicence = await ReviewLicenceHelper.add({ billRunId: id })

      testReviewLicences.push(reviewLicence)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillRunModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('region')

        expect(result).to.be.instanceOf(BillRunModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(testRegion, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to bills', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('bills')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('bills')

        expect(result).to.be.instanceOf(BillRunModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.bills).to.be.an.array()
        expect(result.bills[0]).to.be.an.instanceOf(BillModel)
        expect(result.bills).to.include(testBills[0])
        expect(result.bills).to.include(testBills[1])
      })
    })

    describe('when linking to bill run volumes', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('billRunVolumes')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('billRunVolumes')

        expect(result).to.be.instanceOf(BillRunModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRunVolumes).to.be.an.array()
        expect(result.billRunVolumes[0]).to.be.an.instanceOf(BillRunVolumeModel)
        expect(result.billRunVolumes).to.include(testBillRunVolumes[0])
        expect(result.billRunVolumes).to.include(testBillRunVolumes[1])
      })
    })

    describe('when linking to review Licences', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('reviewLicences')

        expect(query).to.exist()
      })

      it('can eager load the review licences', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('reviewLicences')

        expect(result).to.be.instanceOf(BillRunModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewLicences).to.be.an.array()
        expect(result.reviewLicences[0]).to.be.an.instanceOf(ReviewLicenceModel)
        expect(result.reviewLicences).to.include(testReviewLicences[0])
        expect(result.reviewLicences).to.include(testReviewLicences[1])
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
