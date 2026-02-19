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
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')
const FetchNotificationsService = require('../../../app/services/company-contacts/fetch-notifications.service.js')

// Thing under test
const ViewCompanyContactService = require('../../../app/services/company-contacts/view-company-contact.service.js')

describe('Company Contacts - View Company Contact Service', () => {
  const page = 1

  let auth
  let company
  let companyContact
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
    Sinon.stub(FetchNotificationsService, 'go').returns({
      notifications: [],
      totalNumber: 0
    })

    yarStub = {
      flash: Sinon.stub().returns([{ titleText: 'Updated', text: 'Contact details updated.' }])
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCompanyContactService.go(companyContact.id, auth, yarStub, page)

      expect(result).to.equal({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        notification: {
          text: 'Contact details updated.',
          titleText: 'Updated'
        },
        notifications: [],
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`,
        roles: []
      })
    })
  })
})
