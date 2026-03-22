'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchCompanyContactsService = require('../../../app/services/companies/fetch-company-crm-data.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewContactsService = require('../../../app/services/companies/view-contacts.service.js')

describe('Companies - View Contacts service', () => {
  let auth
  let company
  let contacts
  let page
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    company = CustomersFixtures.company()

    contacts = [
      {
        id: generateUUID(),
        contactType: 'additional-contact',
        contactName: 'Rachael Tyrell'
      }
    ]

    Sinon.stub(FetchCompanyService, 'go').returns(company)

    Sinon.stub(FetchCompanyContactsService, 'go').returns({
      contacts,
      totalNumber: contacts.length
    })

    page = '1'

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerManage').value(true)

    yarStub = {
      flash: Sinon.stub().returns([
        { titleText: 'Contact removed', text: 'Rachael Tyrell was removed from this company.' }
      ])
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactsService.go(company.id, auth, page, yarStub)

      expect(result).to.equal({
        activeSecondaryNav: 'contacts',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        contacts: [
          {
            link: `/system/company-contacts/${contacts[0].id}/contact-details`,
            type: 'Additional contact',
            name: 'Rachael Tyrell'
          }
        ],
        links: {
          createContact: `/system/company-contacts/setup/${company.id}`,
          removeContact: null
        },
        notification: {
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 contacts'
        },
        roles: []
      })
    })
  })
})
