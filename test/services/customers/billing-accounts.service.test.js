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
const FetchBillingAccountsService = require('../../../app/services/customers/fetch-billing-accounts.service.js')
const FetchCustomerService = require('../../../app/services/customers/fetch-customer.service.js')

// Thing under test
const BillingAccountsService = require('../../../app/services/customers/billing-accounts.service.js')

describe('Customers - Billing Accounts Service', () => {
  let auth
  let billingAccount
  let billingAccounts
  let customer
  let page

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    customer = CustomersFixtures.customer()

    billingAccounts = CustomersFixtures.billingAccounts()

    billingAccount = billingAccounts[0]

    Sinon.stub(FetchCustomerService, 'go').returns(customer)

    Sinon.stub(FetchBillingAccountsService, 'go').returns({
      billingAccounts,
      pagination: { total: 1 }
    })

    page = 1
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await BillingAccountsService.go(customer.id, auth, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'billing-accounts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        billingAccounts: [
          {
            accountNumber: billingAccount.accountNumber,
            address: [
              'Tyrell Corporation',
              'ENVIRONMENT AGENCY',
              'HORIZON HOUSE',
              'DEANERY ROAD',
              'BRISTOL',
              'BS1 5AH',
              'United Kingdom'
            ],
            link: `/system/billing-accounts/${billingAccount.id}?company-id=${billingAccount.company.id}`
          }
        ],
        pageTitle: 'Billing accounts',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          numberOfPages: 1,
          showingMessage: 'Showing all 1 billing accounts'
        },
        roles: []
      })
    })
  })
})
