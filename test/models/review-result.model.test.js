'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')
const ReviewResultHelper = require('../support/helpers/review-result.helper.js')
const ReviewReturnHelper = require('../support/helpers/review-return.helper.js')
const ReviewReturnModel = require('../../app/models/review-return.model.js')

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
    describe('when linking to review charge element', () => {
      let testReviewChargeElement

      beforeEach(async () => {
        testReviewChargeElement = await ReviewChargeElementHelper.add()
        testRecord = await ReviewResultHelper.add({ reviewChargeElementId: testReviewChargeElement.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewChargeElements')

        expect(query).to.exist()
      })

      it('can eager load the review charge element', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElements')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeElements).to.be.instanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements).to.equal(testReviewChargeElement)
      })
    })

    describe('when linking to review return', () => {
      let testReviewReturn

      beforeEach(async () => {
        testReviewReturn = await ReviewReturnHelper.add()

        testRecord = await ReviewResultHelper.add({ reviewReturnId: testReviewReturn.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewResultModel.query()
          .innerJoinRelated('reviewReturns')

        expect(query).to.exist()
      })

      it('can eager load the review return', async () => {
        const result = await ReviewResultModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewReturns')

        expect(result).to.be.instanceOf(ReviewResultModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewReturns).to.be.instanceOf(ReviewReturnModel)
        expect(result.reviewReturns).to.equal(testReviewReturn)
      })
    })
  })
})
