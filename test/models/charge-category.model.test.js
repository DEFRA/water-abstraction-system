'use strict'

// Test helpers
const ChargeCategoryHelper = require('../support/helpers/charge-category.helper.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')

// Thing under test
const ChargeCategoryModel = require('../../app/models/charge-category.model.js')

describe('Charge Category model', () => {
  let testChargeReferences
  let testRecord

  beforeAll(async () => {
    testRecord = ChargeCategoryHelper.select()

    // Link charge references
    testChargeReferences = []
    for (let i = 0; i < 2; i++) {
      const chargeReference = await ChargeReferenceHelper.add({
        description: `CE ${i}`,
        chargeCategoryId: testRecord.id
      })

      testChargeReferences.push(chargeReference)
    }
  })

  afterAll(async () => {
    for (const chargeReference of testChargeReferences) {
      await chargeReference.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeCategoryModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ChargeCategoryModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge references', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeCategoryModel.query().innerJoinRelated('chargeReferences')

        expect(query).toBeDefined()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeCategoryModel.query().findById(testRecord.id).withGraphFetched('chargeReferences')

        expect(result).toBeInstanceOf(ChargeCategoryModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReferences).toBeInstanceOf(Array)
        expect(result.chargeReferences[0]).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).toContainEqual(testChargeReferences[0])
        expect(result.chargeReferences).toContainEqual(testChargeReferences[1])
      })
    })
  })
})
