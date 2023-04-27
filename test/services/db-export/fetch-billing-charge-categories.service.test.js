'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const FetchBillingChargeCategoriesService = require('../../../app/services/db-export/fetch-billing-charge-categories.service.js')

const billingChargeCategoriesColumnInfo = [
  'billingChargeCategoryId',
  'reference',
  'subsistenceCharge',
  'description',
  'shortDescription',
  'isTidal',
  'lossFactor',
  'modelTier',
  'isRestrictedSource',
  'minVolume',
  'maxVolume',
  'dateCreated',
  'dateUpdated'
]

describe('Fetch Billing charge categories service', () => {
  let billingChargeCategory

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingChargeCategory = await BillingChargeCategoryHelper.add()
    await BillingChargeCategoryHelper.add()
  })

  describe('when we connect to the db', () => {
    it('returns the table column names', async () => {
      const result = await FetchBillingChargeCategoriesService.go()

      expect(result.headers).to.equal(billingChargeCategoriesColumnInfo)
    })

    it('returns all records in the billing-charge-categories table', async () => {
      const result = await FetchBillingChargeCategoriesService.go()

      expect(result.rows[0][0]).to.equal(billingChargeCategory.billingChargeCategoryId)
      expect(result.rows[0][2]).to.equal(billingChargeCategory.subsistenceCharge)
      expect(result.rows).to.have.length(2)
    })

    it('returns the table name', async () => {
      const result = await FetchBillingChargeCategoriesService.go()

      expect(result.tableName).to.equal('billing_charge_categories')
    })
  })
})
