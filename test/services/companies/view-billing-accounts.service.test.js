'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const FetchBillingAccountsDal = require('../../../app/dal/companies/fetch-billing-accounts.dal.js')
const FetchCompanyDal = require('../../../app/dal/companies/fetch-company.dal.js')

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

    Sinon.stub(FetchCompanyDal, 'go').returns(company)

    Sinon.stub(FetchBillingAccountsDal, 'go').returns({
      billingAccounts,
      totalNumber: 1
    })

    page = '1'
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewBillingAccountsService(company.id, auth, page)

      expect(result).toEqual({
        activeSecondaryNav: 'billing-accounts',
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
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 billing accounts'
        },
        roles: []
      })
    })
  })
})
