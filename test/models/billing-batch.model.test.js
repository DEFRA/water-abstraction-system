'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BillingBatch = require('../../app/models/billing-batch.model.js')

describe('Billing Batch model', () => {
  it('can successfully run a query', async () => {
    const query = await BillingBatch.query()

    expect(query).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      it('can successfully run a query', async () => {
        const query = await BillingBatch.query()
          .innerJoinRelated('region')

        expect(query).to.exist()
      })
    })
  })
})
