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
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchCompanyContactsService = require('../../../app/services/companies/fetch-company-contacts.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewContactsService = require('../../../app/services/companies/view-contacts.service.js')

describe('Companies - View Contacts Service', () => {
  let auth
  let company
  let companyContacts
  let page

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    company = CustomersFixtures.company()

    companyContacts = CustomersFixtures.companyContacts()

    Sinon.stub(FetchCompanyService, 'go').returns(company)

    Sinon.stub(FetchCompanyContactsService, 'go').returns({ companyContacts, pagination: { total: 1 } })

    page = 1

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerManage').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactsService.go(company.id, auth, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'contacts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        companyContacts: [
          {
            action: `/system/companies-contacts/${companyContacts[0].id}`,
            communicationType: 'Additional Contact',
            name: 'Rachael Tyrell',
            email: 'rachael.tyrell@tyrellcorp.com'
          }
        ],
        links: {
          createContact: `/customer/${company.id}/contacts/new`,
          removeContact: `/customer/${company.id}/contacts/remove`
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          numberOfPages: 1,
          showingMessage: 'Showing all 1 contacts'
        },
        roles: []
      })
    })
  })
})
