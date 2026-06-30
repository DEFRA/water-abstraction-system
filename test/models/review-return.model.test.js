'use strict'

// Test helpers
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')
const ReviewChargeElementReturnHelper = require('../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeElementReturnModel = require('../../app/models/review-charge-element-return.model.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')
const ReviewReturnHelper = require('../support/helpers/review-return.helper.js')

// Thing under test
const ReviewReturnModel = require('../../app/models/review-return.model.js')

describe('Review Return model', () => {
  let testRecord
  let testReturnLog
  let testReviewChargeElements
  let testReviewChargeElementReturns
  let testReviewLicence

  beforeAll(async () => {
    testReturnLog = await ReturnLogHelper.add()
    testReviewLicence = await ReviewLicenceHelper.add()

    testRecord = await ReviewReturnHelper.add({ returnLogId: testReturnLog.id, reviewLicenceId: testReviewLicence.id })

    testReviewChargeElements = []
    testReviewChargeElementReturns = []
    for (let i = 0; i < 2; i++) {
      const testReviewChargeElement = await ReviewChargeElementHelper.add()

      testReviewChargeElements.push(testReviewChargeElement)

      const reviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({
        reviewReturnId: testRecord.id,
        reviewChargeElementId: testReviewChargeElement.id
      })

      testReviewChargeElementReturns.push(reviewChargeElementReturn)
    }
  })

  afterAll(async () => {
    await testReturnLog.$query().delete()
    await testReviewLicence.$query().delete()

    for (const reviewChargeElement of testReviewChargeElements) {
      await reviewChargeElement.$query().delete()
    }

    for (const reviewChargeElementReturn of testReviewChargeElementReturns) {
      await reviewChargeElementReturn.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewReturnModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReviewReturnModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('returnLog')

        expect(query).toBeDefined()
      })

      it('can eager load the return log', async () => {
        const result = await ReviewReturnModel.query().findById(testRecord.id).withGraphFetched('returnLog')

        expect(result).toBeInstanceOf(ReviewReturnModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnLog).toBeInstanceOf(ReturnLogModel)
        expect(result.returnLog).toEqual(testReturnLog)
      })
    })

    describe('when linking to review charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('reviewChargeElements')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge elements', async () => {
        const result = await ReviewReturnModel.query().findById(testRecord.id).withGraphFetched('reviewChargeElements')

        expect(result).toBeInstanceOf(ReviewReturnModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeElements).toBeInstanceOf(Array)
        expect(result.reviewChargeElements[0]).toBeInstanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements).toContainEqual(testReviewChargeElements[0])
        expect(result.reviewChargeElements).toContainEqual(testReviewChargeElements[1])
      })
    })

    describe('when linking to review charge element returns', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('reviewChargeElementReturns')

        expect(query).toBeDefined()
      })

      it('can eager load the review charge element returns', async () => {
        const result = await ReviewReturnModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElementReturns')

        expect(result).toBeInstanceOf(ReviewReturnModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewChargeElementReturns).toBeInstanceOf(Array)
        expect(result.reviewChargeElementReturns[0]).toBeInstanceOf(ReviewChargeElementReturnModel)
        expect(result.reviewChargeElementReturns).toContainEqual(testReviewChargeElementReturns[0])
        expect(result.reviewChargeElementReturns).toContainEqual(testReviewChargeElementReturns[1])
      })
    })

    describe('when linking to review licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('reviewLicence')

        expect(query).toBeDefined()
      })

      it('can eager load the review licence', async () => {
        const result = await ReviewReturnModel.query().findById(testRecord.id).withGraphFetched('reviewLicence')

        expect(result).toBeInstanceOf(ReviewReturnModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewLicence).toBeInstanceOf(ReviewLicenceModel)
        expect(result.reviewLicence).toEqual(testReviewLicence)
      })
    })
  })
})
