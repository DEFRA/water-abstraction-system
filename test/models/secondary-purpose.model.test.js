'use strict'

// Test helpers
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')

// Thing under test
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

describe('Secondary Purpose model', () => {
  let testRecordId
  let testLicenceVersionPurposes
  let testReturnRequirementPurposes

  beforeAll(async () => {
    testRecordId = SecondaryPurposeHelper.select().id

    testLicenceVersionPurposes = []
    for (let i = 0; i < 2; i++) {
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        notes: `TEST licence Version purpose ${i}`,
        secondaryPurposeId: testRecordId
      })

      testLicenceVersionPurposes.push(licenceVersionPurpose)
    }

    testReturnRequirementPurposes = []
    for (let i = 0; i < 2; i++) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: `TEST return requirement purpose ${i}`,
        secondaryPurposeId: testRecordId
      })

      testReturnRequirementPurposes.push(returnRequirementPurpose)
    }
  })

  afterAll(async () => {
    for (const licenceVersionPurpose of testLicenceVersionPurposes) {
      await licenceVersionPurpose.$query().delete()
    }

    for (const returnRequirementPurpose of testReturnRequirementPurposes) {
      await returnRequirementPurpose.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await SecondaryPurposeModel.query().findById(testRecordId)

      expect(result).toBeInstanceOf(SecondaryPurposeModel)
      expect(result.id).toEqual(testRecordId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await SecondaryPurposeModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licences', async () => {
        const result = await SecondaryPurposeModel.query()
          .findById(testRecordId)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).toBeInstanceOf(SecondaryPurposeModel)
        expect(result.id).toEqual(testRecordId)

        expect(result.licenceVersionPurposes).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposes[0]).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).toContainEqual(testLicenceVersionPurposes[0])
        expect(result.licenceVersionPurposes).toContainEqual(testLicenceVersionPurposes[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await SecondaryPurposeModel.query().innerJoinRelated('returnRequirementPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licences', async () => {
        const result = await SecondaryPurposeModel.query()
          .findById(testRecordId)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).toBeInstanceOf(SecondaryPurposeModel)
        expect(result.id).toEqual(testRecordId)

        expect(result.returnRequirementPurposes).toBeInstanceOf(Array)
        expect(result.returnRequirementPurposes[0]).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[1])
      })
    })
  })
})
