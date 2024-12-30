'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')

// Thing under test
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')

describe('Primary Purpose model', () => {
  let testRecord

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = PrimaryPurposeHelper.select()
    })

    it('can successfully run a basic query', async () => {
      const result = await PrimaryPurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(PrimaryPurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purposes', () => {
      let testLicenceVersionPurposes

      beforeEach(async () => {
        testRecord = PrimaryPurposeHelper.select()

        testLicenceVersionPurposes = []
        for (let i = 0; i < 2; i++) {
          const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
            notes: `TEST licence Version purpose ${i}`,
            primaryPurposeId: testRecord.id
          })

          testLicenceVersionPurposes.push(licenceVersionPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PrimaryPurposeModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await PrimaryPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).to.be.instanceOf(PrimaryPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposes).to.be.an.array()
        expect(result.licenceVersionPurposes[0]).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).to.include(testLicenceVersionPurposes[0])
        expect(result.licenceVersionPurposes).to.include(testLicenceVersionPurposes[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      let testReturnRequirementPurposes

      beforeEach(async () => {
        testRecord = PrimaryPurposeHelper.select()

        testReturnRequirementPurposes = []
        for (let i = 0; i < 2; i++) {
          const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            alias: `TEST return requirement purpose ${i}`,
            primaryPurposeId: testRecord.id
          })

          testReturnRequirementPurposes.push(returnRequirementPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PrimaryPurposeModel.query().innerJoinRelated('returnRequirementPurposes')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await PrimaryPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).to.be.instanceOf(PrimaryPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirementPurposes).to.be.an.array()
        expect(result.returnRequirementPurposes[0]).to.be.an.instanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[1])
      })
    })
  })
})
