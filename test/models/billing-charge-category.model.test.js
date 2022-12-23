'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../support/helpers/billing-charge-category.helper.js')
const ChargeElementHelper = require('../support/helpers/charge-element.helper.js')
const ChargeElementModel = require('../../app/models/charge-element.model.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')

// Thing under test
const BillingChargeCategoryModel = require('../../app/models/billing-charge-category.model.js')

describe('Billing Charge Category model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await BillingChargeCategoryHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingChargeCategoryModel.query().findById(testRecord.billingChargeCategoryId)

      expect(result).to.be.an.instanceOf(BillingChargeCategoryModel)
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
        const query = await BillingChargeCategoryModel.query()
          .innerJoinRelated('chargeElements')

        expect(query).to.exist()
      })

      it('can eager load the charge elements', async () => {
        const result = await BillingChargeCategoryModel.query()
          .findById(testRecord.billingChargeCategoryId)
          .withGraphFetched('chargeElements')

        expect(result).to.be.instanceOf(BillingChargeCategoryModel)
        expect(result.billingChargeCategoryId).to.equal(testRecord.billingChargeCategoryId)

        expect(result.chargeElements).to.be.an.array()
        expect(result.chargeElements[0]).to.be.an.instanceOf(ChargeElementModel)
        expect(result.chargeElements).to.include(testChargeElements[0])
        expect(result.chargeElements).to.include(testChargeElements[1])
      })
    })
  })
})
