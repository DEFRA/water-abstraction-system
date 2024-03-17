'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')
const ReviewChargeReferenceHelper = require('../support/helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../support/helpers/review-charge-version.helper.js')
const ReviewChargeVersionModel = require('../../app/models/review-charge-version.model.js')

// Thing under test
const ReviewChargeReferenceModel = require('../../app/models/review-charge-reference.model.js')

describe('Review Charge reference model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ReviewChargeReferenceHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeReferenceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeReferenceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to review charge element', () => {
      let testChargeElement

      beforeEach(async () => {
        testRecord = await ReviewChargeReferenceHelper.add()
        testChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId: testRecord.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeReferenceModel.query()
          .innerJoinRelated('reviewChargeElements')

        expect(query).to.exist()
      })

      it('can eager load the review charge element', async () => {
        const result = await ReviewChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElements')

        expect(result).to.be.instanceOf(ReviewChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeElements).to.be.an.array()
        expect(result.reviewChargeElements).to.have.length(1)
        expect(result.reviewChargeElements[0]).to.be.an.instanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements[0]).to.equal(testChargeElement)
      })
    })

    describe('when linking to review charge version', () => {
      let testReviewChargeVersion

      beforeEach(async () => {
        testReviewChargeVersion = await ReviewChargeVersionHelper.add()
        testRecord = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId: testReviewChargeVersion.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeReferenceModel.query()
          .innerJoinRelated('reviewChargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the review charge version', async () => {
        const result = await ReviewChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeVersion')

        expect(result).to.be.instanceOf(ReviewChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeVersion).to.be.an.instanceOf(ReviewChargeVersionModel)
        expect(result.reviewChargeVersion).to.equal(testReviewChargeVersion)
      })
    })
  })
})
