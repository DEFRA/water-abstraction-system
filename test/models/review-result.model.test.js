'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReviewChargeElementResultHelper = require('../support/helpers/review-charge-element-result.helper.js')
const ReviewChargeElementResultModel = require('../../app/models/review-charge-element-result.model.js')
const ReviewResultHelper = require('../support/helpers/review-result.helper.js')
const ReviewReturnResultHelper = require('../support/helpers/review-return-result.helper.js')
const ReviewReturnResultModel = require('../../app/models/review-return-result.model.js')

// Thing under test
const ReviewResultModel = require('../../app/models/review-result.model.js')

describe('Review Result model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewResultHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewResultModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewResultModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to review charge element result', () => {
      let testReviewChargeElementResult

      beforeEach(async () => {
        testReviewChargeElementResult = await ReviewChargeElementResultHelper.add()
        testRecord = await ReviewResultHelper.add({ reviewChargeElementResultId: testReviewChargeElementResult.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewChargeElementResults')

        expect(query).to.exist()
      })

      it('can eager load the review charge element result', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElementResults')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeElementResults).to.be.instanceOf(ReviewChargeElementResultModel)
        expect(result.reviewChargeElementResults).to.equal(testReviewChargeElementResult)
      })
    })

    describe('when linking to review return result', () => {
      let testReviewReturnResult

      beforeEach(async () => {
        testReviewReturnResult = await ReviewReturnResultHelper.add()

        testRecord = await ReviewResultHelper.add({ reviewReturnResultId: testReviewReturnResult.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewReturnResults')

        expect(query).to.exist()
      })

      it('can eager load the review return result', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewReturnResults')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewReturnResults).to.be.instanceOf(ReviewReturnResultModel)
        expect(result.reviewReturnResults).to.equal(testReviewReturnResult)
      })
    })

    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        testRecord = await ReviewResultHelper.add({ licenceId: testLicence.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
