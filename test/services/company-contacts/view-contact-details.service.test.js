'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const YarStub = require('../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchAbstractionAlertLicencesDal = require('../../../app/dal/company-contacts/fetch-abstraction-alert-licences.dal.js')
const FetchCompanyContactDetailsService = require('../../../app/services/company-contacts/fetch-company-contact-details.service.js')
const FetchCompanyService = require('../../../app/dal/companies/fetch-company.dal.js')

// Thing under test
const ViewContactDetailsService = require('../../../app/services/company-contacts/view-contact-details.service.js')

describe('Company Contacts - View Contact Details Service', () => {
  let auth
  let company
  let companyContact
  let yarStub

  beforeEach(() => {
    auth = { credentials: { roles: [] } }

    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    Sinon.stub(FetchAbstractionAlertLicencesDal, 'go').resolves([])
    Sinon.stub(FetchCompanyService, 'go').resolves(company)
    Sinon.stub(FetchCompanyContactDetailsService, 'go').resolves(companyContact)

    yarStub = YarStub.build(Sinon)
    yarStub.flash.returns([{ titleText: 'Updated', text: 'Contact details updated.' }])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactDetailsService(companyContact.id, auth, yarStub)

      expect(result).toEqual({
        activeSecondaryNav: 'contact-details',
        additionalContact: true,
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        contact: {
          abstractionAlertsLabel: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          licences: [],
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        notification: {
          text: 'Contact details updated.',
          titleText: 'Updated'
        },
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`,
        roles: [],
        warning: null
      })
    })
  })
})
