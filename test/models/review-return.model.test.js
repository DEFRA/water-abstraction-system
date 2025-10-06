'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')
const ReviewChargeElementReturnHelper = require('../support/helpers/review-charge-element-return.helper.js')
const ReviewReturnHelper = require('../support/helpers/review-return.helper.js')

// Thing under test
const ReviewReturnModel = require('../../app/models/review-return.model.js')

describe('Review Return model', () => {
  let testRecord
  let testReturnLog
  let testReviewChargeElements
  let testReviewLicence

  before(async () => {
    testReturnLog = await ReturnLogHelper.add()
    testReviewLicence = await ReviewLicenceHelper.add()

    testRecord = await ReviewReturnHelper.add({ returnId: testReturnLog.id, reviewLicenceId: testReviewLicence.id })

    testReviewChargeElements = []
    for (let i = 0; i < 2; i++) {
      const testReviewChargeElement = await ReviewChargeElementHelper.add()

      testReviewChargeElements.push(testReviewChargeElement)

      await ReviewChargeElementReturnHelper.add({
        reviewReturnId: testRecord.id,
        reviewChargeElementId: testReviewChargeElement.id
      })
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewReturnModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewReturnModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to return log', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('returnLog')

        expect(query).to.exist()
      })

      it('can eager load the return log', async () => {
        const result = await ReviewReturnModel.query().findById(testRecord.id).withGraphFetched('returnLog')

        expect(result).to.be.instanceOf(ReviewReturnModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnLog).to.be.an.instanceOf(ReturnLogModel)
        expect(result.returnLog).to.equal(testReturnLog)
      })
    })

    describe('when linking to review charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('reviewChargeElements')

        expect(query).to.exist()
      })

      it('can eager load the review charge elements', async () => {
        const result = await ReviewReturnModel.query().findById(testRecord.id).withGraphFetched('reviewChargeElements')

        expect(result).to.be.instanceOf(ReviewReturnModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeElements).to.be.an.array()
        expect(result.reviewChargeElements[0]).to.be.an.instanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements).to.include(testReviewChargeElements[0])
        expect(result.reviewChargeElements).to.include(testReviewChargeElements[1])
      })
    })

    describe('when linking to review licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewReturnModel.query().innerJoinRelated('reviewLicence')

        expect(query).to.exist()
      })

      it('can eager load the review licence', async () => {
        const result = await ReviewReturnModel.query().findById(testRecord.id).withGraphFetched('reviewLicence')

        expect(result).to.be.instanceOf(ReviewReturnModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewLicence).to.be.an.instanceOf(ReviewLicenceModel)
        expect(result.reviewLicence).to.equal(testReviewLicence)
      })
    })
  })
})
