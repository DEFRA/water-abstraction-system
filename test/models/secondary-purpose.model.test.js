'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')

// Thing under test
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

describe('Secondary Purpose model', () => {
  const testRecordId = SecondaryPurposeHelper.select().id

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await SecondaryPurposeModel.query().findById(testRecordId)

      expect(result).to.be.an.instanceOf(SecondaryPurposeModel)
      expect(result.id).to.equal(testRecordId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purposes', () => {
      let testLicenceVersionPurposes

      beforeEach(async () => {
        testLicenceVersionPurposes = []
        for (let i = 0; i < 2; i++) {
          const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
            notes: `TEST licence Version purpose ${i}`,
            secondaryPurposeId: testRecordId
          })

          testLicenceVersionPurposes.push(licenceVersionPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await SecondaryPurposeModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await SecondaryPurposeModel.query()
          .findById(testRecordId)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).to.be.instanceOf(SecondaryPurposeModel)
        expect(result.id).to.equal(testRecordId)

        expect(result.licenceVersionPurposes).to.be.an.array()
        expect(result.licenceVersionPurposes[0]).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).to.include(testLicenceVersionPurposes[0])
        expect(result.licenceVersionPurposes).to.include(testLicenceVersionPurposes[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      let testReturnRequirementPurposes

      beforeEach(async () => {
        testReturnRequirementPurposes = []
        for (let i = 0; i < 2; i++) {
          const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
            alias: `TEST return requirement purpose ${i}`,
            secondaryPurposeId: testRecordId
          })

          testReturnRequirementPurposes.push(returnRequirementPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await SecondaryPurposeModel.query().innerJoinRelated('returnRequirementPurposes')

        expect(query).to.exist()
      })

      it('can eager load the bill licences', async () => {
        const result = await SecondaryPurposeModel.query()
          .findById(testRecordId)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).to.be.instanceOf(SecondaryPurposeModel)
        expect(result.id).to.equal(testRecordId)

        expect(result.returnRequirementPurposes).to.be.an.array()
        expect(result.returnRequirementPurposes[0]).to.be.an.instanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[1])
      })
    })
  })
})
