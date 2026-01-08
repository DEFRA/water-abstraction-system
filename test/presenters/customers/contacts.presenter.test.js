'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Thing under test
const ContactsPresenter = require('../../../app/presenters/customers/contacts.presenter.js')

describe('Customers - Contacts Presenter', () => {
  const userId = '1000'

  let auth
  let customer

  beforeEach(() => {
    auth = { credentials: { user: { id: userId } } }

    customer = CustomersFixtures.customer()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter.go(customer, auth)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        links: {
          createContact: `/contact-entry/newCompanyContact.${customer.id}.${userId}/select-contact`,
          removeContact: `/customer/${customer.id}/contacts/remove`
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
