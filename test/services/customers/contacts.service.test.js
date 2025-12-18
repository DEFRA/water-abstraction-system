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

// Thing under test
const ContactsService = require('../../../app/services/customers/contacts.service.js')

describe('Customers - Contacts Service', () => {
  let customer

  beforeEach(async () => {
    customer = CustomersFixtures.customer()

    Sinon.stub(FetchCustomerService, 'go').returns(customer)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ContactsService.go(customer.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'contacts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
