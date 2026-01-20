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
const FetchCustomerService = require('../../../app/services/customers/fetch-customer.service.js')
const FetchCompanyContactService = require('../../../app/services/customers-contacts/fetch-company-contact.service.js')

// Thing under test
const ViewManageService = require('../../../app/services/customers-contacts/view-manage.service.js')

describe('Customers contacts - View Manage Service', () => {
  let companyContact
  let company

  beforeEach(async () => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.customer()

    Sinon.stub(FetchCustomerService, 'go').returns(company)
    Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewManageService.go(companyContact.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/customers/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          name: 'Rachael Tyrell'
        },
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
