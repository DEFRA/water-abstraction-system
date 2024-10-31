'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceVersionPurposeConditionHelper = require('../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../support/helpers/licence-version-purpose-condition-type.helper.js')
const LicenceVersionPurposeConditionTypeModel = require('../../app/models/licence-version-purpose-condition-type.model.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')

// Thing under test
const LicenceVersionPurposeConditionModel = require('../../app/models/licence-version-purpose-condition.model.js')

describe('Licence Version Purpose Condition model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionPurposeConditionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeConditionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionPurposeConditionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose', () => {
      let testLicenceVersionPurpose

      beforeEach(async () => {
        testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()

        testRecord = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeId: testLicenceVersionPurpose.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query()
          .innerJoinRelated('licenceVersionPurpose')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurpose')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurpose).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurpose).to.equal(testLicenceVersionPurpose)
      })
    })

    describe('when linking to licence version purpose condition type', () => {
      const licenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.select()

      beforeEach(async () => {
        testRecord = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id
        })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeConditionModel.query()
          .innerJoinRelated('licenceVersionPurposeConditionType')

        expect(query).to.exist()
      })

      it('can eager load the licence version purpose condition type', async () => {
        const result = await LicenceVersionPurposeConditionModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditionType')

        expect(result).to.be.instanceOf(LicenceVersionPurposeConditionModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposeConditionType).to.be.an.instanceOf(LicenceVersionPurposeConditionTypeModel)
        expect(result.licenceVersionPurposeConditionType.id).to.equal(licenceVersionPurposeConditionType.id)
      })
    })
  })
})
