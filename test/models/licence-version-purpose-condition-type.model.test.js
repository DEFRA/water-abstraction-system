// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceVersionPurposeConditionHelper from '../support/helpers/licence-version-purpose-condition.helper.js'
import LicenceVersionPurposeConditionModel from '../../app/models/licence-version-purpose-condition.model.js'
import LicenceVersionPurposeConditionTypeHelper from '../support/helpers/licence-version-purpose-condition-type.helper.js'

// Thing under test
import LicenceVersionPurposeConditionTypeModel from '../../app/models/licence-version-purpose-condition-type.model.js'

describe('Licence Version Purposes Condition Type model', () => {
  let testLicenceVersionPurposeCondition
  let testRecord

  beforeAll(async () => {
    testRecord = LicenceVersionPurposeConditionTypeHelper.select()

    testLicenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeConditionTypeId: testRecord.id
    })
  })

  afterAll(async () => {
    await testLicenceVersionPurposeCondition.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionTypeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceVersionPurposeConditionTypeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose condition', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionTypeModel.query().innerJoinRelated(
          'licenceVersionPurposeConditions'
        )

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purpose condition', async () => {
        const result = await LicenceVersionPurposeConditionTypeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditions')

        expect(result).toBeInstanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.id).toEqual(testRecord.id)

        const foundRecord = result.licenceVersionPurposeConditions.find((record) => {
          return record.id === testLicenceVersionPurposeCondition.id
        })

        expect(foundRecord).toBeInstanceOf(LicenceVersionPurposeConditionModel)
      })
    })
  })
})
