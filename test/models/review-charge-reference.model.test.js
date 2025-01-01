'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')
const { closeConnection } = require('../support/database.js')
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
    testRecord = await ReviewChargeReferenceHelper.add()
  })

  after(async () => {
    await closeConnection()
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
        const query = await ReviewChargeReferenceModel.query().innerJoinRelated('reviewChargeElements')

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
        const query = await ReviewChargeReferenceModel.query().innerJoinRelated('reviewChargeVersion')

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

    describe('when linking to charge reference', () => {
      let testChargeReference

      beforeEach(async () => {
        testChargeReference = await ChargeReferenceHelper.add()
        testRecord = await ReviewChargeReferenceHelper.add({ chargeReferenceId: testChargeReference.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewChargeReferenceModel.query().innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await ReviewChargeReferenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(ReviewChargeReferenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReference).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReference).to.equal(testChargeReference)
      })
    })
  })
})
