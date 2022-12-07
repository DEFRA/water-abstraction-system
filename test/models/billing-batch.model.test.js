'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BillingBatch = require('../../app/models/billing-batch.model.js')

describe('Billing Batch model', () => {
  it('returns data', async () => {
    const query = await BillingBatch.query()

    expect(query).to.exist()
  })
})
