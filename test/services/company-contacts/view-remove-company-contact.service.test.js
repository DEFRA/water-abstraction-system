'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const FetchAbstractionAlertLicencesDal = require('../../../app/dal/company-contacts/fetch-abstraction-alert-licences.dal.js')
const FetchCompanyContactDal = require('../../../app/dal/company-contacts/fetch-company-contact.dal.js')
const FetchCompanyService = require('../../../app/dal/companies/fetch-company.dal.js')

// Thing under test
const ViewRemoveCompanyContactService = require('../../../app/services/company-contacts/view-remove-company-contact.service.js')

describe('Company Contacts - View Remove Company Contact Service', () => {
  let companyContact
  let company

  beforeEach(async () => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    Sinon.stub(FetchAbstractionAlertLicencesDal, 'go').resolves([])
    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchCompanyContactDal, 'go').returns(companyContact)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewRemoveCompanyContactService(companyContact.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/${companyContact.id}/contact-details`,
          text: 'Go back to contact details'
        },
        contact: {
          abstractionAlertsLabel: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          licences: [],
          name: 'Rachael Tyrell'
        },
        pageTitle: "You're about to remove this contact",
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
