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
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewRemoveCompanyContactService = require('../../../app/services/company-contacts/view-remove-company-contact.service.js')

describe('Company Contacts - View Remove Company Contact Service', () => {
  let companyContact
  let company

  beforeEach(async () => {
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
      const result = await ViewRemoveCompanyContactService.go(companyContact.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: `You're about to remove this contact`
      })
    })
  })
})
