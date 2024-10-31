'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')
const LicenceVersionPurposeConditionTypeHelper = require('../support/helpers/licence-version-purpose-condition-type.helper.js')

// Thing under test
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')

describe('Licence Version Purposes Condition Type model', () => {
  const licenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.select()

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionTypeModel
        .query().findById(licenceVersionPurposeConditionType.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeConditionTypeModel)
      expect(result.id).to.equal(licenceVersionPurposeConditionType.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose condition', () => {
      let testLicenceVersionPurposeCondition

      beforeEach(async () => {
        testLicenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionTypeModel.query()
          .innerJoinRelated('licenceVersionPurposeConditions')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition', async () => {
        const result = await LicenceVersionPurposeConditionTypeModel.query()
          .findById(licenceVersionPurposeConditionType.id)
          .withGraphFetched('licenceVersionPurposeConditions')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.id).to.equal(licenceVersionPurposeConditionType.id)

        const foundRecord = result.licenceVersionPurposeConditions.find((record) => {
          return record.id === testLicenceVersionPurposeCondition.id
        })

        expect(foundRecord).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
      })
    })
  })
})
