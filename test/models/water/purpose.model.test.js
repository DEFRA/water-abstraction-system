'use strict'

// Test helpers
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
const PurposeHelper = require('../../support/helpers/water/purpose.helper.js')

// Thing under test
const PurposeModel = require('../../../app/models/water/purpose.model.js')

describe('Purpose model', () => {
  let testChargeElement
  let testRecord

  beforeEach(async () => {
    testRecord = await PurposeHelper.add()

    const { purposeUseId } = testRecord
    testChargeElement = await ChargeElementHelper.add({ purposeUseId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await PurposeModel.query().findById(testRecord.purposeUseId)

      expect(result).toBeInstanceOf(PurposeModel)
      expect(result.purposeUseId).toBe(testRecord.purposeUseId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge element', () => {
      it('can successfully run a related query', async () => {
        const query = await PurposeModel.query()
          .innerJoinRelated('chargeElement')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge element', async () => {
        const result = await PurposeModel.query()
          .findById(testRecord.purposeUseId)
          .withGraphFetched('chargeElement')

        expect(result).toBeInstanceOf(PurposeModel)
        expect(result.purposeUseId).toBe(testRecord.purposeUseId)

        expect(result.chargeElement).toBeInstanceOf(ChargeElementModel)
        expect(result.chargeElement).toEqual(testChargeElement)
      })
    })
  })
})
