'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const ReviewChargeElementHelper = require('../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../app/models/review-charge-element.model.js')

// Thing under test
const ChargeElementModel = require('../../app/models/charge-element.model.js')

describe('Charge Element model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ChargeElementHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ChargeElementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeElementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge reference', () => {
      let testChargeReference

      beforeEach(async () => {
        testChargeReference = await ChargeReferenceHelper.add()

        const { id: chargeReferenceId } = testChargeReference

        testRecord = await ChargeElementHelper.add({ chargeReferenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReference).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReference).to.equal(testChargeReference)
      })
    })

    describe('when linking to purpose', () => {
      let testPurpose

      beforeEach(async () => {
        testPurpose = PurposeHelper.select()

        const { id: purposeId } = testPurpose

        testRecord = await ChargeElementHelper.add({ purposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('purpose')

        expect(query).to.exist()
      })

      it('can eager load the purposes use', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('purpose')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purpose).to.be.an.instanceOf(PurposeModel)
        expect(result.purpose).to.equal(testPurpose, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to review charge elements', () => {
      let testReviewChargeElements

      beforeEach(async () => {
        testRecord = await ChargeElementHelper.add()

        testReviewChargeElements = []
        for (let i = 0; i < 2; i++) {
          const reviewChargeElement = await ReviewChargeElementHelper.add({ chargeElementId: testRecord.id })

          testReviewChargeElements.push(reviewChargeElement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('reviewChargeElements')

        expect(query).to.exist()
      })

      it('can eager load the review charge elements', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeElements')

        expect(result).to.be.instanceOf(ChargeElementModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeElements).to.be.an.array()
        expect(result.reviewChargeElements[0]).to.be.an.instanceOf(ReviewChargeElementModel)
        expect(result.reviewChargeElements).to.include(testReviewChargeElements[0])
        expect(result.reviewChargeElements).to.include(testReviewChargeElements[1])
      })
    })
  })
})
