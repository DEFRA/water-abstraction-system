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
const BillingChargeCategoriesTableExportService = require('../../../app/services/db-export/billing-charge-categories-table-export.service.js')

describe('Billing charge categories table export service', () => {
  let billingChargeCategory

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingChargeCategory = await BillingChargeCategoryHelper.add()
    await BillingChargeCategoryHelper.add()
  })

  describe('when we connect to the db', () => {
    it('returns all records in the billing-charge-categories table', async () => {
      const results = await BillingChargeCategoriesTableExportService.go()
      expect(results[0].billingChargeCategoryId).to.equal(billingChargeCategory.billingChargeCategoryId)
      expect(results[0].subsistenceCharge).to.equal(billingChargeCategory.subsistenceCharge)
      expect(results).to.have.length(2)
    })
  })
})
