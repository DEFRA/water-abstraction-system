'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const { closeConnection } = require('../support/database.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReviewChargeVersionHelper = require('../support/helpers/review-charge-version.helper.js')
const ReviewChargeVersionModel = require('../../app/models/review-charge-version.model.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewReturnHelper = require('../support/helpers/review-return.helper.js')
const ReviewReturnModel = require('../../app/models/review-return.model.js')

// Thing under test
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')

describe('Review Licence model', () => {
  let testRecord

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewLicenceHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewLicenceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewLicenceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a bill run', () => {
      let testBillRun

      beforeEach(async () => {
        testBillRun = await BillRunHelper.add()

        testRecord = await ReviewLicenceHelper.add({ billRunId: testBillRun.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).to.be.instanceOf(ReviewLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRun).to.be.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to a licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        testRecord = await ReviewLicenceHelper.add({ licenceId: testLicence.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(ReviewLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to review charge versions', () => {
      let reviewChargeVersions

      beforeEach(async () => {
        testRecord = await ReviewLicenceHelper.add()
        const { id: reviewLicenceId } = testRecord

        reviewChargeVersions = []
        for (let i = 0; i < 2; i++) {
          const reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId })

          reviewChargeVersions.push(reviewChargeVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('reviewChargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the review charge version', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('reviewChargeVersions')

        expect(result).to.be.instanceOf(ReviewLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeVersions).to.be.an.array()
        expect(result.reviewChargeVersions[0]).to.be.an.instanceOf(ReviewChargeVersionModel)
        expect(result.reviewChargeVersions).to.include(reviewChargeVersions[0])
        expect(result.reviewChargeVersions).to.include(reviewChargeVersions[1])
      })
    })

    describe('when linking to review returns', () => {
      let reviewReturns

      beforeEach(async () => {
        testRecord = await ReviewLicenceHelper.add()
        const { id: reviewLicenceId } = testRecord

        reviewReturns = []
        for (let i = 0; i < 2; i++) {
          const reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId })

          reviewReturns.push(reviewReturn)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query().innerJoinRelated('reviewReturns')

        expect(query).to.exist()
      })

      it('can eager load the review returns', async () => {
        const result = await ReviewLicenceModel.query().findById(testRecord.id).withGraphFetched('reviewReturns')

        expect(result).to.be.instanceOf(ReviewLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewReturns).to.be.an.array()
        expect(result.reviewReturns[0]).to.be.an.instanceOf(ReviewReturnModel)
        expect(result.reviewReturns).to.include(reviewReturns[0])
        expect(result.reviewReturns).to.include(reviewReturns[1])
      })
    })
  })
})
