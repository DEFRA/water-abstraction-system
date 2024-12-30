'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const ChargeElementHelper = require('../support/helpers/charge-element.helper.js')
const ChargeElementModel = require('../../app/models/charge-element.model.js')
const { closeConnection } = require('../support/database.js')
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementReturnHelper = require('../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeReferenceHelper = require('../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../app/models/review-charge-reference.model.js')
const ReviewReturnHelper = require('../support/helpers/review-return.helper.js')
const ReviewReturnModel = require('../../app/models/review-return.model.js')

// Thing under test
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')

describe('Review Charge Element model', () => {
  let testRecord

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewChargeElementHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeElementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to review charge reference', () => {
      let testReviewChargeReference

      beforeEach(async () => {
        testReviewChargeReference = await ReviewChargeReferenceHelper.add()

        const { id: reviewChargeReferenceId } = testReviewChargeReference

        testRecord = await ReviewChargeElementHelper.add({ reviewChargeReferenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('reviewChargeReference')

        expect(query).to.exist()
      })

      it('can eager load the review charge reference', async () => {
        const result = await ReviewChargeElementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeReference')

        expect(result).to.be.instanceOf(ReviewChargeElementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeReference).to.be.an.instanceOf(ReviewChargeReferenceModel)
        expect(result.reviewChargeReference).to.equal(testReviewChargeReference)
      })
    })

    describe('when linking to review returns', () => {
      let testReviewReturns

      beforeEach(async () => {
        testRecord = await ReviewChargeElementHelper.add()
        const { id: reviewChargeElementId } = testRecord

        testReviewReturns = []
        for (let i = 0; i < 2; i++) {
          const testReviewReturn = await ReviewReturnHelper.add()

          testReviewReturns.push(testReviewReturn)

          await ReviewChargeElementReturnHelper.add({
            reviewChargeElementId,
            reviewReturnId: testReviewReturn.id
          })
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('reviewReturns')

        expect(query).to.exist()
      })

      it('can eager load the review returns', async () => {
        const result = await ReviewChargeElementModel.query().findById(testRecord.id).withGraphFetched('reviewReturns')

        expect(result).to.be.instanceOf(ReviewChargeElementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewReturns).to.be.an.array()
        expect(result.reviewReturns[0]).to.be.an.instanceOf(ReviewReturnModel)
        expect(result.reviewReturns).to.include(testReviewReturns[0])
        expect(result.reviewReturns).to.include(testReviewReturns[1])
      })
    })

    describe('when linking to a charge element', () => {
      let testChargeElement

      beforeEach(async () => {
        testChargeElement = await ChargeElementHelper.add()

        const { id: chargeElementId } = testChargeElement

        testRecord = await ReviewChargeElementHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeElementModel.query().innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })

      it('can eager load the charge element', async () => {
        const result = await ReviewChargeElementModel.query().findById(testRecord.id).withGraphFetched('chargeElement')

        expect(result).to.be.instanceOf(ReviewChargeElementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeElement).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElement).to.equal(testChargeElement)
      })
    })
  })
})
