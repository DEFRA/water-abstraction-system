'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')
const ReviewChargeElementReturnHelper = require('../support/helpers/review-charge-element-return.helper.js')

// Thing under test
const ReviewChargeElementReturnModel = require('../../app/models/review-charge-element-return.model.js')

describe('Review Charge Element Return model', () => {
  let testRecord
  let testReviewChargeElement

  before(async () => {
    testReviewChargeElement = await ReviewChargeElementHelper.add()

    testRecord = await ReviewChargeElementReturnHelper.add({ reviewChargeElementId: testReviewChargeElement.id })
  })

  after(async () => {
    await testReviewChargeElement.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementReturnModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeElementReturnModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to a review charge element', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementReturnModel.query().innerJoinRelated('reviewChargeElement')

        expect(query).to.exist()
      })

      it('can eager load the review charge element', async () => {
        const result = await ReviewChargeElementReturnModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElement')

        expect(result).to.be.instanceOf(ReviewChargeElementReturnModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeElement).to.be.an.instanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElement).to.equal(testReviewChargeElement)
      })
    })
  })
})
