'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Things we need to stub
const FetchCustomerService = require('../../../app/services/customers/fetch-customer.service.js')

// Thing under test
const BillingAccountsService = require('../../../app/services/customers/billing-accounts.service.js')

describe('Customers - Billing Accounts Service', () => {
  let customer

  beforeEach(async () => {
    customer = CustomersFixtures.customer()

    Sinon.stub(FetchCustomerService, 'go').returns(customer)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await BillingAccountsService.go(customer.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'billing-accounts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Billing accounts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
