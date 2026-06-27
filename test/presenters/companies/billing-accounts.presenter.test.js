'use strict'

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const BillingAccountsPresenter = require('../../../app/presenters/companies/billing-accounts.presenter.js')

describe('Companies - Billing Accounts presenter', () => {
  let billingAccount
  let billingAccounts
  let company

  beforeEach(() => {
    company = CustomersFixtures.company()

    billingAccounts = CustomersFixtures.billingAccounts()

    billingAccount = billingAccounts[0]
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = BillingAccountsPresenter.go(company, billingAccounts)

      expect(result).toEqual({
        backLink: {
          href: '/',
          text: 'Go back to search'
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
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
