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

// Thing under test
const ViewCompanyContactService = require('../../../app/services/company-contacts/view-company-contact.service.js')

describe('Company Contacts - View Company Contact Service', () => {
  let auth
  let companyContact
  let company

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCompanyContactService.go(companyContact.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          name: 'Rachael Tyrell'
        },
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`,
        roles: []
      })
    })
  })
})
