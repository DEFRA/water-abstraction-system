'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
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
    describe('when linking to review charge element results', () => {
      let testReviewChargeElementResult
      let testRecords

      beforeEach(async () => {
        testReviewChargeElementResult = await ReviewChargeElementResultHelper.add()

        testRecords = []
        for (let i = 0; i < 2; i++) {
          testRecord = await ReviewResultHelper.add({ reviewChargeElementResultId: testReviewChargeElementResult.id })
          testRecords.push(testRecord)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewReturnResults')

        expect(query).to.exist()
      })

      it('can eager load the review charge element results', async () => {
        const result = await ReviewResultModel.query()
          .where('reviewChargeElementResultId', testReviewChargeElementResult.id)
          .withGraphFetched('reviewChargeElementResults')

        expect(result[0]).to.be.instanceOf(ReviewResultModel)
        expect(result[1]).to.be.instanceOf(ReviewResultModel)

        expect(result[0].id).to.equal(testRecords[0].id)
        expect(result[1].id).to.equal(testRecords[1].id)

        expect(result[0].reviewChargeElementResults).to.be.an.array()
        expect(result[1].reviewChargeElementResults).to.be.an.array()

        expect(result[0].reviewChargeElementResults[0]).to.be.instanceOf(ReviewChargeElementResultModel)
        expect(result[1].reviewChargeElementResults[0]).to.be.instanceOf(ReviewChargeElementResultModel)

        expect(result[0].reviewChargeElementResults).to.include(testReviewChargeElementResult)
        expect(result[1].reviewChargeElementResults).to.include(testReviewChargeElementResult)
      })
    })

    describe('when linking to review return results', () => {
      let testReviewReturnResult
      let testRecords

      beforeEach(async () => {
        testReviewReturnResult = await ReviewReturnResultHelper.add()

        testRecords = []
        for (let i = 0; i < 2; i++) {
          testRecord = await ReviewResultHelper.add({ reviewReturnResultId: testReviewReturnResult.id })
          testRecords.push(testRecord)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewReturnResults')

        expect(query).to.exist()
      })

      it('can eager load the review return results', async () => {
        const result = await ReviewResultModel.query()
          .where('reviewReturnResultId', testReviewReturnResult.id)
          .withGraphFetched('reviewReturnResults')

        expect(result[0]).to.be.instanceOf(ReviewResultModel)
        expect(result[1]).to.be.instanceOf(ReviewResultModel)

        expect(result[0].id).to.equal(testRecords[0].id)
        expect(result[1].id).to.equal(testRecords[1].id)

        expect(result[0].reviewReturnResults).to.be.an.array()
        expect(result[1].reviewReturnResults).to.be.an.array()

        expect(result[0].reviewReturnResults[0]).to.be.instanceOf(ReviewReturnResultModel)
        expect(result[1].reviewReturnResults[0]).to.be.instanceOf(ReviewReturnResultModel)

        expect(result[0].reviewReturnResults).to.include(testReviewReturnResult)
        expect(result[1].reviewReturnResults).to.include(testReviewReturnResult)
      })
    })
  })
})
