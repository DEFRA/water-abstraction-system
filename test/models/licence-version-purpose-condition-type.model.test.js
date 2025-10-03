'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeConditionTypeHelper = require('../support/helpers/licence-version-purpose-condition-type.helper.js')

// Thing under test
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')

describe('Licence Version Purposes Condition Type model', () => {
  let testLicenceVersionPurposeCondition
  let testRecord

  before(async () => {
    testRecord = LicenceVersionPurposeConditionTypeHelper.select()

    testLicenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeConditionTypeId: testRecord.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionTypeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeConditionTypeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose condition', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionTypeModel.query().innerJoinRelated(
          'licenceVersionPurposeConditions'
        )

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition', async () => {
        const result = await LicenceVersionPurposeConditionTypeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditions')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.id).to.equal(testRecord.id)

        const foundRecord = result.licenceVersionPurposeConditions.find((record) => {
          return record.id === testLicenceVersionPurposeCondition.id
        })

        expect(foundRecord).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
      })
    })
  })
})
