'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const CreateBillingBatchService = require('../../../app/services/supplementary-billing/create-billing-batch.service.js')

describe('Create Billing Batch service', () => {
  const regionId = '6ac6cd43-af79-492a-9b82-15a70411c906'
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  it('creates a billing batch record', async () => {
    const result = await CreateBillingBatchService.go(regionId, billingPeriod)

    expect(result.regionId).to.equal(regionId)
    expect(result.fromFinancialYearEnding).to.equal(2023)
    expect(result.toFinancialYearEnding).to.equal(2023)
  })
})
