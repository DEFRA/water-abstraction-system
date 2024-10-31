'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../support/helpers/charge-element.helper.js')
const ChargeElementModel = require('../../app/models/charge-element.model.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')
const LicenceVersionPurposeHelper = require('../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeModel = require('../../app/models/licence-version-purpose.model.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const ReturnRequirementPurposeHelper = require('../support/helpers/return-requirement-purpose.helper.js')
const ReturnRequirementPurposeModel = require('../../app/models/return-requirement-purpose.model.js')

// Thing under test
const PurposeModel = require('../../app/models/purpose.model.js')

describe('Purpose model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = PurposeHelper.select()
    })

    it('can successfully run a basic query', async () => {
      const result = await PurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(PurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge elements', () => {
      let testChargeElements

      beforeEach(async () => {
        testRecord = PurposeHelper.select()

        testChargeElements = []
        for (let i = 0; i < 2; i++) {
          const chargeElement = await ChargeElementHelper.add({ purposeId: testRecord.id })

          testChargeElements.push(chargeElement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('chargeElements')

        expect(query).to.exist()
      })

      it('can eager load the charge elements', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeElements')

        expect(result).to.be.instanceOf(PurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeElements).to.be.an.array()
        expect(result.chargeElements[0]).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElements).to.include(testChargeElements[0])
        expect(result.chargeElements).to.include(testChargeElements[1])
      })
    })

    describe('when linking to charge references', () => {
      let testChargeReferences

      beforeEach(async () => {
        testRecord = PurposeHelper.select()

        testChargeReferences = []
        for (let i = 0; i < 2; i++) {
          const chargeReference = await ChargeReferenceHelper.add({ purposeId: testRecord.id })

          testChargeReferences.push(chargeReference)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(PurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })

    describe('when linking to licence version purposes', () => {
      let testLicenceVersionPurposes

      beforeEach(async () => {
        testRecord = PurposeHelper.select()

        testLicenceVersionPurposes = []
        for (let i = 0; i < 2; i++) {
          const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ purposeId: testRecord.id })

          testLicenceVersionPurposes.push(licenceVersionPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('licenceVersionPurposes')

        expect(query).to.exist()
      })

      it('can eager load the licence version purposes', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposes')

        expect(result).to.be.instanceOf(PurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionPurposes).to.be.an.array()
        expect(result.licenceVersionPurposes[0]).to.be.an.instanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).to.include(testLicenceVersionPurposes[0])
        expect(result.licenceVersionPurposes).to.include(testLicenceVersionPurposes[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      let testReturnRequirementPurposes

      beforeEach(async () => {
        testRecord = PurposeHelper.select()

        testReturnRequirementPurposes = []
        for (let i = 0; i < 2; i++) {
          const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({ purposeId: testRecord.id })

          testReturnRequirementPurposes.push(returnRequirementPurpose)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('returnRequirementPurposes')

        expect(query).to.exist()
      })

      it('can eager load the return requirement purposes', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).to.be.instanceOf(PurposeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.returnRequirementPurposes).to.be.an.array()
        expect(result.returnRequirementPurposes[0]).to.be.an.instanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).to.include(testReturnRequirementPurposes[1])
      })
    })
  })
})
