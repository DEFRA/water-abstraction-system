'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../support/helpers/water/charge-category.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const ChargeCategoryModel = require('../../../app/models/water/charge-category.model.js')

describe('Charge Category model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ChargeCategoryHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeCategoryModel.query().findById(testRecord.billingChargeCategoryId)

      expect(result).to.be.an.instanceOf(ChargeCategoryModel)
      expect(result.billingChargeCategoryId).to.equal(testRecord.billingChargeCategoryId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge references', () => {
      let testChargeReferences

      beforeEach(async () => {
        const { billingChargeCategoryId } = testRecord

        testChargeReferences = []
        for (let i = 0; i < 2; i++) {
          const chargeReference = await ChargeReferenceHelper.add({ description: `CE ${i}`, billingChargeCategoryId })
          testChargeReferences.push(chargeReference)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeCategoryModel.query()
          .innerJoinRelated('chargeReferences')

        expect(query).to.exist()
      })

      it('can eager load the charge references', async () => {
        const result = await ChargeCategoryModel.query()
          .findById(testRecord.billingChargeCategoryId)
          .withGraphFetched('chargeReferences')

        expect(result).to.be.instanceOf(ChargeCategoryModel)
        expect(result.billingChargeCategoryId).to.equal(testRecord.billingChargeCategoryId)

        expect(result.chargeReferences).to.be.an.array()
        expect(result.chargeReferences[0]).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReferences).to.include(testChargeReferences[0])
        expect(result.chargeReferences).to.include(testChargeReferences[1])
      })
    })
  })
})
