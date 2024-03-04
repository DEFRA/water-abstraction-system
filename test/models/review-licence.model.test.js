'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ReviewLicenceHelper = require('../support/helpers/review-licence.helper.js')
const ReviewResultHelper = require('../support/helpers/review-result.helper.js')
const ReviewResultModel = require('../../app/models/review-result.model.js')

// Thing under test
const ReviewLicenceModel = require('../../app/models/review-licence.model.js')

describe('Review Licence model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewLicenceHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewLicenceModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewLicenceModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        testRecord = await ReviewLicenceHelper.add({ licenceId: testLicence.id })
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ReviewLicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ReviewLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to review results', () => {
      let reviewResults

      beforeEach(async () => {
        testRecord = await ReviewLicenceHelper.add()
        const { id: reviewLicenceId } = testRecord

        reviewResults = []
        for (let i = 0; i < 2; i++) {
          const reviewResult = await ReviewResultHelper.add({ reviewLicenceId })
          reviewResults.push(reviewResult)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ReviewLicenceModel.query()
          .innerJoinRelated('reviewResults')

        expect(query).to.exist()
      })

      it('can eager load the return results', async () => {
        const result = await ReviewLicenceModel.query()
          .findById(testRecord.id)
          .withGraphFetched('reviewResults')

        expect(result).to.be.instanceOf(ReviewLicenceModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.reviewResults).to.be.an.array()
        expect(result.reviewResults[0]).to.be.an.instanceOf(ReviewResultModel)
        expect(result.reviewResults).to.include(reviewResults[0])
        expect(result.reviewResults).to.include(reviewResults[1])
      })
    })
  })
})
