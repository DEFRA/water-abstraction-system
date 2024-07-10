'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')

// Thing under test
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')

describe('Licence Version Purposes model', () => {
  const testRecordId = '4eac5d7e-21e4-475c-8108-3e0c2ece181f'

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionTypeModel.query().findById(testRecordId)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeConditionTypeModel)
      expect(result.id).to.equal(testRecordId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose condition', () => {
      let testLicenceVersionPurposeCondition

      beforeEach(async () => {
        testLicenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeConditionTypeId: testRecordId
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionTypeModel.query()
          .innerJoinRelated('licenceVersionPurposeConditions')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition', async () => {
        const result = await LicenceVersionPurposeConditionTypeModel.query()
          .findById(testRecordId)
          .withGraphFetched('licenceVersionPurposeConditions')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.id).to.equal(testRecordId)

        const foundRecord = result.licenceVersionPurposeConditions.find((record) => {
          return record.id === testLicenceVersionPurposeCondition.id
        })

        expect(foundRecord).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
      })
    })
  })
})
