'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const PurposeModel = require('../../app/models/purpose.model.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

// Thing under test
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')

describe('Licence Version Purposes model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionPurposeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version', () => {
      let testLicenceVersion

      beforeEach(async () => {
        testLicenceVersion = await LicenceVersionHelper.add()

        const { id } = testLicenceVersion

        testRecord = await LicenceVersionPurposeHelper.add({ licenceVersionId: id })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('licenceVersion')

        expect(query).to.exist()
      })

      it('can eager load the licence version', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersion')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersion).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersion.id).to.equal(testLicenceVersion.id)
      })
    })

    describe('when linking to licence version purpose conditions', () => {
      let testLicenceVersionPurposeConditions

      beforeEach(async () => {
        testRecord = await LicenceVersionPurposeHelper.add()

        testLicenceVersionPurposeConditions = []
        for (let i = 0; i < 2; i++) {
          const licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
            licenceVersionPurposeId: testRecord.id
          })

          testLicenceVersionPurposeConditions.push(licenceVersionPurposeCondition)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('licenceVersionPurposeConditions')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose conditions', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditions')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposeConditions).to.be.an.array()
        expect(result.licenceVersionPurposeConditions[0]).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.licenceVersionPurposeConditions).to.include(testLicenceVersionPurposeConditions[0])
        expect(result.licenceVersionPurposeConditions).to.include(testLicenceVersionPurposeConditions[1])
      })
    })

    describe('when linking to primary purpose', () => {
      let testPrimaryPurpose

      beforeEach(async () => {
        testPrimaryPurpose = await PrimaryPurposeHelper.add()

        const { id: primaryPurposeId } = testPrimaryPurpose

        testRecord = await LicenceVersionPurposeHelper.add({ primaryPurposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('primaryPurpose')

        expect(query).to.exist()
      })

      it('can eager load the primary purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('primaryPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.primaryPurpose).to.be.an.instanceOf(PrimaryPurposeModel)
        expect(result.primaryPurpose.id).to.equal(testPrimaryPurpose.id)
      })
    })

    describe('when linking to purpose', () => {
      let testPurpose

      beforeEach(async () => {
        testPurpose = await PurposeHelper.add()

        const { id: purposeId } = testPurpose

        testRecord = await LicenceVersionPurposeHelper.add({ purposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('purpose')

        expect(query).to.exist()
      })

      it('can eager load the purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('purpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.purpose).to.be.an.instanceOf(PurposeModel)
        expect(result.purpose.id).to.equal(testPurpose.id)
      })
    })

    describe('when linking to secondary purpose', () => {
      let testSecondaryPurpose

      beforeEach(async () => {
        testSecondaryPurpose = await SecondaryPurposeHelper.add()

        const { id: secondaryPurposeId } = testSecondaryPurpose

        testRecord = await LicenceVersionPurposeHelper.add({ secondaryPurposeId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query()
          .innerJoinRelated('secondaryPurpose')

        expect(query).to.exist()
      })

      it('can eager load the secondary purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('secondaryPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.secondaryPurpose).to.be.an.instanceOf(SecondaryPurposeModel)
        expect(result.secondaryPurpose.id).to.equal(testSecondaryPurpose.id)
      })
    })
  })

  describe('$electricityGeneration', () => {
    describe('when instance has not been set with the additional properties needed', () => {
      beforeEach(async () => {
        testRecord = await LicenceVersionPurposeHelper.add()
      })

      it('throws an error', () => {
        expect(() => {
          return testRecord.$electricityGeneration()
        }).to.throw(TypeError)
      })
    })
  })

  describe('when the instance has been set with the additional properties needed', () => {
    let invalidPrimaryPurpose
    let invalidPurpose
    let invalidSecondaryPurpose

    let validPrimaryPurpose
    let validPurpose
    let validSecondaryPurpose

    beforeEach(async () => {
      invalidPrimaryPurpose = await PrimaryPurposeHelper.add({ legacyId: 'A' })
      invalidSecondaryPurpose = await SecondaryPurposeHelper.add({ legacyId: 'AGR' })
      invalidPurpose = await PurposeHelper.add({ legacyId: '400' })

      validPrimaryPurpose = await PrimaryPurposeHelper.add({ legacyId: 'P' })
      validSecondaryPurpose = await SecondaryPurposeHelper.add({ legacyId: 'ELC' })
      validPurpose = await PurposeHelper.add({ legacyId: '200' })
    })

    describe('but the primary purpose is not "P" (Production Of Energy)', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: invalidPrimaryPurpose.id,
          secondaryPurposeId: validSecondaryPurpose.id,
          purposeId: validPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns false', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).to.be.false()
      })
    })

    describe('but the secondary purpose is not "ELC" (Electricity)', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: validPrimaryPurpose.id,
          secondaryPurposeId: invalidSecondaryPurpose.id,
          purposeId: validPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns false', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).to.be.false()
      })
    })

    describe('but the purpose is not "200" or "240"', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: validPrimaryPurpose.id,
          secondaryPurposeId: validSecondaryPurpose.id,
          purposeId: invalidPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns false', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).to.be.false()
      })
    })

    describe('and the purpose plus primary and secondary purpose are all electricity generating', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: validPrimaryPurpose.id,
          secondaryPurposeId: validSecondaryPurpose.id,
          purposeId: validPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns true', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).to.be.true()
      })
    })
  })
})
