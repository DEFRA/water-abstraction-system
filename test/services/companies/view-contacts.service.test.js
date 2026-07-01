'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Test helpers
const YarStub = require('../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchCompanyContactsDal = require('../../../app/dal/companies/fetch-company-crm-data.dal.js')
const FetchCompanyDal = require('../../../app/dal/companies/fetch-company.dal.js')

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

    Sinon.stub(FetchCompanyDal, 'go').returns(company)

    Sinon.stub(FetchCompanyContactsDal, 'go').returns({
      contacts,
      totalNumber: contacts.length
    })

    page = '1'

    yarStub = YarStub.build(Sinon)
    yarStub.flash.returns([{ titleText: 'Contact removed', text: 'Rachael Tyrell was removed from this company.' }])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactsService.go(company.id, auth, page, yarStub)

      expect(result).toEqual({
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
          createContact: `/system/company-contacts/setup/${company.id}`
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
