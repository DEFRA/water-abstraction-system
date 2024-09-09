'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')

// Thing under test
const FetchTableService = require('../../../../app/services/jobs/export/fetch-table.service.js')

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
  beforeEach(() => {
    ChargeCategoryHelper.select()
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
  })
})
