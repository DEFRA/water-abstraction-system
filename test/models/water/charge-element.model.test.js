'use strict'

// Test helpers
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const PurposeModel = require('../../../app/models/water/purpose.model.js')
const PurposeHelper = require('../../support/helpers/water/purpose.helper.js')

// Thing under test
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')

describe('Charge Element model', () => {
  let testChargeReference
  let testPurpose
  let testRecord

  beforeAll(async () => {
    testChargeReference = await ChargeReferenceHelper.add()
    testPurpose = await PurposeHelper.add()

    const { chargeElementId } = testChargeReference
    const { purposeUseId } = testPurpose
    testRecord = await ChargeElementHelper.add({ chargeElementId, purposeUseId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeElementModel.query().findById(testRecord.chargePurposeId)

      expect(result).toBeInstanceOf(ChargeElementModel)
      expect(result.chargePurposeId).toBe(testRecord.chargePurposeId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge reference', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(ChargeElementModel)
        expect(result.chargePurposeId).toBe(testRecord.chargePurposeId)

        expect(result.chargeReference).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReference).toEqual(testChargeReference)
      })
    })

    describe('when linking to purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeElementModel.query()
          .innerJoinRelated('purpose')

        expect(query).toBeTruthy()
      })

      it('can eager load the purposes use', async () => {
        const result = await ChargeElementModel.query()
          .findById(testRecord.chargePurposeId)
          .withGraphFetched('purpose')

        expect(result).toBeInstanceOf(ChargeElementModel)
        expect(result.chargePurposeId).toBe(testRecord.chargePurposeId)

        expect(result.purpose).toBeInstanceOf(PurposeModel)
        expect(result.purpose).toEqual(testPurpose)
      })
    })
  })
})
