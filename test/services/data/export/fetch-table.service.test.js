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
  beforeEach(async () => {
    await DatabaseHelper.clean()

    await BillingChargeCategoryHelper.add()
  })

  describe('when we connect to the db', () => {
    const tableName = 'billing_charge_categories'
    const schemaName = 'water'

    it('returns the table column names', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.headers).to.equal(billingChargeCategoriesColumnInfo)
    })

    it('returns the query to fetch the billing-charge-categories table', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.rows).to.be.an.instanceof(Promise)
    })

    it('returns the table name', async () => {
      const result = await FetchTableService.go(tableName, schemaName)

      expect(result.tableName).to.equal('billing_charge_categories')
    })
  })
})
