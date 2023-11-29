'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const ReviewResultHelper = require('../support/helpers/review-result.helper.js')
const ReviewResultModel = require('../../app/models/review-result.model.js')
const ReviewReturnResultHelper = require('../support/helpers/review-return-result.helper.js')

// Thing under test
const ReviewReturnResultModel = require('../../app/models/review-return-result.model.js')

describe('Review Return Result model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewReturnResultHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewReturnResultModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewReturnResultModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to review results', () => {
      let testReviewResults

      beforeEach(async () => {
        testRecord = await ReviewReturnResultHelper.add()
        const { id: reviewReturnResultId } = testRecord

        testReviewResults = []
        for (let i = 0; i < 2; i++) {
          const testReviewResult = await ReviewResultHelper.add({ reviewReturnResultId })
          testReviewResults.push(testReviewResult)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewReturnResultModel.query()
          .innerJoinRelated('reviewResults')

        expect(query).to.exist()
      })

      it('can eager load the review results', async () => {
        const result = await ReviewReturnResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewResults')

        expect(result).to.be.instanceOf(ReviewReturnResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewResults).to.be.an.array()
        expect(result.reviewResults[0]).to.be.an.instanceOf(ReviewResultModel)
        expect(result.reviewResults).to.include(testReviewResults[0])
        expect(result.reviewResults).to.include(testReviewResults[1])
      })
    })
  })
})
