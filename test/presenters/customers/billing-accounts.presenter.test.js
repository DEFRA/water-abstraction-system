'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Thing under test
const BillingAccountsPresenter = require('../../../app/presenters/customers/billing-accounts.presenter.js')

describe('Customers - Billing Accounts Presenter', () => {
  let billingAccount
  let billingAccounts
  let customer

  beforeEach(() => {
    customer = CustomersFixtures.customer()

    billingAccounts = CustomersFixtures.billingAccounts()

    billingAccount = billingAccounts[0]
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = BillingAccountsPresenter.go(customer, billingAccounts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        billingAccounts: [
          {
            accountNumber: billingAccount.accountNumber,
            address: [
              'Tyrell Corporation',
              'Environment Agency',
              'Horizon House',
              'Deanery Road',
              'Bristol',
              'BS1 5AH'
            ],
            link: `/system/billing-accounts/${billingAccount.id}?company-id=${billingAccount.company.id}`
          }
        ],
        pageTitle: 'Billing accounts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
