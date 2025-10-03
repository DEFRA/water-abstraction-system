'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const ReviewChargeReferenceHelper = require('../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../app/models/review-charge-reference.model.js')
const ReviewChargeVersionHelper = require('../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')

// Thing under test
const ReviewChargeVersionModel = require('../../app/models/review-charge-version.model.js')

describe('Review Charge Version model', () => {
  let testChargeReference
  let testChargeVersion
  let testRecord
  let testReviewLicence

  before(async () => {
    testChargeVersion = await ChargeVersionHelper.add()
    testReviewLicence = await ReviewLicenceHelper.add()

    testRecord = await ReviewChargeVersionHelper.add({
      chargeVersionId: testChargeVersion.id,
      reviewLicenceId: testReviewLicence.id
    })

    testChargeReference = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId: testRecord.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeVersionModel.query().innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ReviewChargeVersionModel.query().findById(testRecord.id).withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(ReviewChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersion).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })

    describe('when linking to review charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeVersionModel.query().innerJoinRelated('reviewChargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the review charge reference', async () => {
        const result = await ReviewChargeVersionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewChargeReferences')

        expect(result).to.be.instanceOf(ReviewChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewChargeReferences).to.be.an.array()
        expect(result.reviewChargeReferences).to.have.length(1)
        expect(result.reviewChargeReferences[0]).to.be.an.instanceOf(ReviewChargeReferenceModel)
        expect(result.reviewChargeReferences[0]).to.equal(testChargeReference)
      })
    })

    describe('when linking to review licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ReviewChargeVersionModel.query().innerJoinRelated('reviewLicence')

        expect(query).to.exist()
      })

      it('can eager load the review licence', async () => {
        const result = await ReviewChargeVersionModel.query().findById(testRecord.id).withGraphFetched('reviewLicence')

        expect(result).to.be.instanceOf(ReviewChargeVersionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewLicence).to.be.an.instanceOf(ReviewLicenceModel)
        expect(result.reviewLicence).to.equal(testReviewLicence)
      })
    })
  })
})
