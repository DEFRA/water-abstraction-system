'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const FetchBillingAccountsService = require('../../../app/services/companies/fetch-billing-accounts.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewBillingAccountsService = require('../../../app/services/companies/view-billing-accounts.service.js')

describe('Companies - View Billing Accounts service', () => {
  let auth
  let billingAccount
  let billingAccounts
  let company
  let page

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    company = CustomersFixtures.company()

    billingAccounts = CustomersFixtures.billingAccounts()

    billingAccount = billingAccounts[0]

    Sinon.stub(FetchCompanyService, 'go').returns(company)

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
      const result = await ViewBillingAccountsService.go(company.id, auth, page)

      expect(result).to.equal({
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
