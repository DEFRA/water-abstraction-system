'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const ReviewChargeElementResultHelper = require('../support/helpers/review-charge-element-result.helper.js')
const ReviewResultHelper = require('../support/helpers/review-result.helper.js')
const ReviewResultModel = require('../../app/models/review-result.model.js')

// Thing under test
const ReviewChargeElementResultModel = require('../../app/models/review-charge-element-result.model.js')

describe('Review Charge Element Result model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewChargeElementResultHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementResultModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeElementResultModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to review results', () => {
      let testReviewResults

      beforeEach(async () => {
        testRecord = await ReviewChargeElementResultHelper.add()
        const { id: reviewChargeElementResultId } = testRecord

        testReviewResults = []
        for (let i = 0; i < 2; i++) {
          const testReviewResult = await ReviewResultHelper.add({ reviewChargeElementResultId })
          testReviewResults.push(testReviewResult)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementResultModel.query()
          .innerJoinRelated('reviewResults')

        expect(query).to.exist()
      })

      it('can eager load the review results', async () => {
        const result = await ReviewChargeElementResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewResults')

        expect(result).to.be.instanceOf(ReviewChargeElementResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewResults).to.be.an.array()
        expect(result.reviewResults[0]).to.be.an.instanceOf(ReviewResultModel)
        expect(result.reviewResults).to.include(testReviewResults[0])
        expect(result.reviewResults).to.include(testReviewResults[1])
      })
    })
  })
})
