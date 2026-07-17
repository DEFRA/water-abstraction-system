// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceVersionPurposeHelper from '../support/helpers/licence-version-purpose.helper.js'
import LicenceVersionPurposeModel from '../../app/models/licence-version-purpose.model.js'
import PrimaryPurposeHelper from '../support/helpers/primary-purpose.helper.js'
import ReturnRequirementPurposeHelper from '../support/helpers/return-requirement-purpose.helper.js'
import ReturnRequirementPurposeModel from '../../app/models/return-requirement-purpose.model.js'

// Thing under test
import PrimaryPurposeModel from '../../app/models/primary-purpose.model.js'

describe('Primary Purpose model', () => {
  let testLicenceVersionPurposes
  let testRecord
  let testReturnRequirementPurposes

  beforeAll(async () => {
    testRecord = PrimaryPurposeHelper.select()

    testLicenceVersionPurposes = []
    for (let i = 0; i < 2; i++) {
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        notes: `TEST licence Version purpose ${i}`,
        primaryPurposeId: testRecord.id
      })

      testLicenceVersionPurposes.push(licenceVersionPurpose)
    }

    testReturnRequirementPurposes = []
    for (let i = 0; i < 2; i++) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: `TEST return requirement purpose ${i}`,
        primaryPurposeId: testRecord.id
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
      const result = await PrimaryPurposeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(PrimaryPurposeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await PrimaryPurposeModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licences', async () => {
        const result = await PrimaryPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).toBeInstanceOf(PrimaryPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurposes).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposes[0]).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).toContainEqual(testLicenceVersionPurposes[0])
        expect(result.licenceVersionPurposes).toContainEqual(testLicenceVersionPurposes[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await PrimaryPurposeModel.query().innerJoinRelated('returnRequirementPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the bill licences', async () => {
        const result = await PrimaryPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).toBeInstanceOf(PrimaryPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirementPurposes).toBeInstanceOf(Array)
        expect(result.returnRequirementPurposes[0]).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[1])
      })
    })
  })
})
