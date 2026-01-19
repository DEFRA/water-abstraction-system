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
const FetchCompanyContactsService = require('../../../app/services/customers/fetch-company-contacts.service.js')
const FetchCustomerService = require('../../../app/services/customers/fetch-customer.service.js')

// Thing under test
const ViewContactsService = require('../../../app/services/customers/view-contacts.service.js')

describe('Customers - View Contacts Service', () => {
  let auth
  let customer
  let companyContacts
  let page

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    customer = CustomersFixtures.customer()

    companyContacts = CustomersFixtures.companyContacts()

    Sinon.stub(FetchCustomerService, 'go').returns(customer)

    Sinon.stub(FetchCompanyContactsService, 'go').returns({ companyContacts, pagination: { total: 1 } })

    page = 1

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerManage').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactsService.go(customer.id, auth, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'contacts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        companyContacts: [
          {
            action: `/system/customers/${customer.id}/contact/${companyContacts[0].contact.id}`,
            communicationType: 'Additional Contact',
            name: 'Rachael Tyrell',
            email: 'rachael.tyrell@tyrellcorp.com'
          }
        ],
        links: {
          createContact: `/customer/${customer.id}/contacts/new`,
          removeContact: `/customer/${customer.id}/contacts/remove`
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
