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

      beforeEach(async () => {
        testReviewChargeElementResult = await ReviewChargeElementResultHelper.add()
        testRecord = await ReviewResultHelper.add({ reviewChargeElementResultId: testReviewChargeElementResult.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewChargeElementResult')

        expect(query).to.exist()
      })

      it('can eager load the review charge element result', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElementResult')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewReturnResult).to.be.instanceOf(ReviewChargeElementResultModel)
        expect(result.reviewReturnResult).to.equal(testReviewChargeElementResult)
      })
    })

    describe('when linking to review return results', () => {
      let testReviewReturnResult

      beforeEach(async () => {
        testReviewReturnResult = await ReviewReturnResultHelper.add()

        testRecord = await ReviewResultHelper.add({ reviewReturnResultId: testReviewReturnResult.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewReturnResult')

        expect(query).to.exist()
      })

      it('can eager load the review return result', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewReturnResult')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewReturnResult).to.be.instanceOf(ReviewReturnResultModel)
        expect(result.reviewReturnResult).to.equal(testReviewReturnResult)
      })
    })
  })
})
