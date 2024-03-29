'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypesHelper = require('../support/helpers/licence-version-purpose-condition-type.helper.js')
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')

// Thing under test
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')

describe('Licence Version Purposes model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await LicenceVersionPurposeConditionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose condition', () => {
      let testLicenceVersionPurposeConditionType

      beforeEach(async () => {
        testLicenceVersionPurposeConditionType = await LicenceVersionPurposeConditionTypesHelper.add()
        testRecord = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeConditionTypeId: testLicenceVersionPurposeConditionType.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query()
          .innerJoinRelated('licenceVersionPurposeConditionTypes')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition type', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditionTypes')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposeConditionTypes[0]).to.be.an.instanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.licenceVersionPurposeConditionTypes[0].id).to.equal(testLicenceVersionPurposeConditionType.id)
      })
    })
  })
})
