'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../support/helpers/water/charge-category.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeElementModel = require('../../../app/models/water/charge-element.model.js')
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
    describe('when linking to charge elements', () => {
      let testChargeElements

      beforeEach(async () => {
        const { billingChargeCategoryId } = testRecord

        testChargeElements = []
        for (let i = 0; i < 2; i++) {
          const chargeElement = await ChargeElementHelper.add({ description: `CE ${i}`, billingChargeCategoryId })
          testChargeElements.push(chargeElement)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await ChargeCategoryModel.query()
          .innerJoinRelated('chargeElements')

        expect(query).to.exist()
      })

      it('can eager load the charge elements', async () => {
        const result = await ChargeCategoryModel.query()
          .findById(testRecord.billingChargeCategoryId)
          .withGraphFetched('chargeElements')

        expect(result).to.be.instanceOf(ChargeCategoryModel)
        expect(result.billingChargeCategoryId).to.equal(testRecord.billingChargeCategoryId)

        expect(result.chargeElements).to.be.an.array()
        expect(result.chargeElements[0]).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElements).to.include(testChargeElements[0])
        expect(result.chargeElements).to.include(testChargeElements[1])
      })
    })
  })
})
