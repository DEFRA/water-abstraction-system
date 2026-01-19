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
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ContactsPresenter = require('../../../app/presenters/customers/contacts.presenter.js')

describe('Customers - Contacts Presenter', () => {
  let customer
  let companyContacts

  beforeEach(() => {
    customer = CustomersFixtures.customer()

    companyContacts = CustomersFixtures.companyContacts()

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerManage').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter.go(customer, companyContacts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        companyContacts: [
          {
            action: `/system/customers/${customer.id}/contact/${companyContacts[0].contact.id}`,
            communicationType: 'Additional Contact',
            name: 'Rachael Tyrell',
            email: 'rachael.tyrell@tyrellcorp.com'
          }
        ],
        links: {
          createContact: `/customer/${customer.id}/contacts/new`,
          removeContact: `/customer/${customer.id}/contacts/remove`
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
