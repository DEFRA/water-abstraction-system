'use strict'

// Test helpers
const ChargeCategoryHelper = require('../../support/helpers/water/charge-category.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')

// Thing under test
const ChargeCategoryModel = require('../../../app/models/water/charge-category.model.js')

describe('Charge Category model', () => {
  let testChargeReferences
  let testRecord

  beforeAll(async () => {
    testChargeReferences = []
    testRecord = await ChargeCategoryHelper.add()

    const { billingChargeCategoryId } = testRecord

    for (let i = 0; i < 2; i++) {
      const chargeReference = await ChargeReferenceHelper.add({ description: `CE ${i}`, billingChargeCategoryId })
      testChargeReferences.push(chargeReference)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeCategoryModel.query().findById(testRecord.billingChargeCategoryId)

      expect(result).toBeInstanceOf(ChargeCategoryModel)
      expect(result.billingChargeCategoryId).toBe(testRecord.billingChargeCategoryId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeCategoryModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeCategoryModel.query()
          .findById(testRecord.billingChargeCategoryId)
          .withGraphFetched('chargeReferences')

        expect(result).toBeInstanceOf(ChargeCategoryModel)
        expect(result.billingChargeCategoryId).toEqual(testRecord.billingChargeCategoryId)

        expect(result.chargeReferences).toBeInstanceOf(Array)
        expect(result.chargeReferences[0]).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).toContainEqual(testChargeReferences[0])
        expect(result.chargeReferences).toContainEqual(testChargeReferences[1])
      })
    })
  })
})
