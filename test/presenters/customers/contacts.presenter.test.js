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
  let companyContacts

  beforeEach(() => {
    auth = { credentials: { user: { id: userId } } }

    customer = CustomersFixtures.customer()

    companyContacts = CustomersFixtures.companyContacts()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter.go(customer, auth, companyContacts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        companyContacts: [
          {
            action: `customer/${customer.id}/contacts/${companyContacts[0].contact.id}`,
            name: 'Rachael Tyrell',
            email: 'rachael.tyrell@tyrellcorp.com'
          }
        ],
        links: {
          createContact: `/contact-entry/newCompanyContact.${customer.id}.${userId}/select-contact`,
          removeContact: `/customer/${customer.id}/contacts/remove`
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "companyContacts" property', () => {
      describe('the "email" property', () => {
        describe('when there is an email', () => {
          it('returns the email', () => {
            const {
              companyContacts: [result]
            } = ContactsPresenter.go(customer, auth, companyContacts)

            expect(result.email).to.equal('rachael.tyrell@tyrellcorp.com')
          })
        })

        describe('when there is no email', () => {
          beforeEach(() => {
            companyContacts[0].email = null
          })

          it('returns null', () => {
            const {
              companyContacts: [result]
            } = ContactsPresenter.go(customer, auth, companyContacts)

            expect(result.email).to.equal('rachael.tyrell@tyrellcorp.com')
          })
        })
      })
    })
  })
})
