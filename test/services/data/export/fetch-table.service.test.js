'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingChargeCategoryHelper = require('../../../support/helpers/water/billing-charge-category.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Thing under test
const FetchTableService = require('../../../../app/services/data/export/fetch-table.service.js')

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

describe('Fetch table service', () => {
  let billingChargeCategory

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingChargeCategory = await BillingChargeCategoryHelper.add()
    await BillingChargeCategoryHelper.add()
  })

  describe('when we connect to the db', () => {
    const tableName = 'billing_charge_categories'
    const schemaName = 'water'

    it('returns the table column names', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.headers).to.equal(billingChargeCategoriesColumnInfo)
    })

    it('returns all records in the billing-charge-categories table', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.rows[0][0]).to.equal(billingChargeCategory.billingChargeCategoryId)
      expect(result.rows[0][2]).to.equal(billingChargeCategory.subsistenceCharge)
      expect(result.rows).to.have.length(2)
    })

    it('returns the table name', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.tableName).to.equal('billing_charge_categories')
    })
  })
})
