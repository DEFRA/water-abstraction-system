'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BillingChargeCategory = require('../../app/models/billing-charge-category.model.js')

describe('Billing Charge Category model', () => {
  it('can successfully run a query', async () => {
    const query = await BillingChargeCategory.query()

    expect(query).to.exist()
  })

  describe('Relationships', () => {
    describe('when linking to charge element', () => {
      it('can successfully run a query', async () => {
        const query = await BillingChargeCategory.query()
          .innerJoinRelated('chargeElement')

        expect(query).to.exist()
      })
    })
  })
})
