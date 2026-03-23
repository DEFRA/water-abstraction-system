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
const FetchCompanyContactDetailsService = require('../../../app/services/company-contacts/fetch-company-contact-details.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewContactDetailsService = require('../../../app/services/company-contacts/view-contact-details.service.js')

describe('Company Contacts - View Contact Details Service', () => {
  let auth
  let company
  let companyContact
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchCompanyContactDetailsService, 'go').returns(companyContact)

    yarStub = {
      flash: Sinon.stub().returns([{ titleText: 'Updated', text: 'Contact details updated.' }])
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactDetailsService.go(companyContact.id, auth, yarStub)

      expect(result).to.equal({
        activeSecondaryNav: 'contact-details',
        notification: {
          text: 'Contact details updated.',
          titleText: 'Updated'
        },
        roles: [],
        additionalContact: true,
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
      })
    })
  })
})
