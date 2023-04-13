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

describe('Connecting to database', () => {
  let billingChargeCategory

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingChargeCategory = await BillingChargeCategoryHelper.add()
  })

  it('confirms connection to the db by not throwing an error', async () => {
    await expect(BillingChargeCategoriesTableExportService.go()).to.not.reject()
  })

  it('Returns the first row in the billing-charge-categories table', async () => {
    const result = await BillingChargeCategoriesTableExportService.go()
    expect(result[0].billingChargeCategoryId).to.equal(billingChargeCategory.billingChargeCategoryId)
    expect(result[0].subsistenceCharge).to.equal(billingChargeCategory.subsistenceCharge)
  })
})
