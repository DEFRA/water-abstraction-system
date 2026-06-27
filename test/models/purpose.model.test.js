'use strict'

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
  let testChargeElements
  let testChargeReferences
  let testLicenceVersionPurposes
  let testRecord
  let testReturnRequirementPurposes

  beforeAll(async () => {
    testRecord = PurposeHelper.select()

    testChargeElements = []
    for (let i = 0; i < 2; i++) {
      const chargeElement = await ChargeElementHelper.add({ purposeId: testRecord.id })

      testChargeElements.push(chargeElement)
    }

    testChargeReferences = []
    for (let i = 0; i < 2; i++) {
      const chargeReference = await ChargeReferenceHelper.add({ purposeId: testRecord.id })

      testChargeReferences.push(chargeReference)
    }

    testLicenceVersionPurposes = []
    for (let i = 0; i < 2; i++) {
      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ purposeId: testRecord.id })

      testLicenceVersionPurposes.push(licenceVersionPurpose)
    }

    testReturnRequirementPurposes = []
    for (let i = 0; i < 2; i++) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({ purposeId: testRecord.id })

      testReturnRequirementPurposes.push(returnRequirementPurpose)
    }
  })

  afterAll(async () => {
    for (const chargeElement of testChargeElements) {
      await chargeElement.$query().delete()
    }

    for (const chargeReference of testChargeReferences) {
      await chargeReference.$query().delete()
    }

    for (const licenceVersionPurpose of testLicenceVersionPurposes) {
      await licenceVersionPurpose.$query().delete()
    }

    for (const returnRequirementPurpose of testReturnRequirementPurposes) {
      await returnRequirementPurpose.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await PurposeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(PurposeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge elements', () => {
      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query().innerJoinRelated('chargeElements')

        expect(query).toBeDefined()
      })

      it('can eager load the charge elements', async () => {
        const result = await PurposeModel.query().findById(testRecord.id).withGraphFetched('chargeElements')

        expect(result).toBeInstanceOf(PurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeElements).toBeInstanceOf(Array)
        expect(result.chargeElements[0]).toBeInstanceOf(ChargeElementModel)
        expect(result.chargeElements).toContainEqual(testChargeElements[0])
        expect(result.chargeElements).toContainEqual(testChargeElements[1])
      })
    })

    describe('when linking to charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query().innerJoinRelated('chargeReferences')

        expect(query).toBeDefined()
      })

      it('can eager load the charge references', async () => {
        const result = await PurposeModel.query().findById(testRecord.id).withGraphFetched('chargeReferences')

        expect(result).toBeInstanceOf(PurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReferences).toBeInstanceOf(Array)
        expect(result.chargeReferences[0]).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).toContainEqual(testChargeReferences[0])
        expect(result.chargeReferences).toContainEqual(testChargeReferences[1])
      })
    })

    describe('when linking to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purposes', async () => {
        const result = await PurposeModel.query().findById(testRecord.id).withGraphFetched('licenceVersionPurposes')

        expect(result).toBeInstanceOf(PurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurposes).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposes[0]).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes).toContainEqual(testLicenceVersionPurposes[0])
        expect(result.licenceVersionPurposes).toContainEqual(testLicenceVersionPurposes[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query().innerJoinRelated('returnRequirementPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the return requirement purposes', async () => {
        const result = await PurposeModel.query().findById(testRecord.id).withGraphFetched('returnRequirementPurposes')

        expect(result).toBeInstanceOf(PurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirementPurposes).toBeInstanceOf(Array)
        expect(result.returnRequirementPurposes[0]).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[1])
      })
    })
  })
})
