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
  let customer
  let companyContacts

  beforeEach(() => {
    customer = CustomersFixtures.customer()

    companyContacts = CustomersFixtures.companyContacts()
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
            action: `/customer/${customer.id}/contacts/${companyContacts[0].contact.id}`,
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

    describe('the "companyContacts" property', () => {
      describe('the "communicationType" property', () => {
        describe('when the company contact is marked for abstraction alerts', () => {
          beforeEach(() => {
            companyContacts[0].abstractionAlerts = true
          })

          it('returns the string "Water abstraction alerts"', () => {
            const {
              companyContacts: [result]
            } = ContactsPresenter.go(customer, companyContacts)

            expect(result.communicationType).to.equal('Water abstraction alerts')
          })
        })

        describe('when the company contact is not marked for abstraction alerts', () => {
          it('returns the email', () => {
            const {
              companyContacts: [result]
            } = ContactsPresenter.go(customer, companyContacts)

            expect(result.communicationType).to.equal('Additional Contact')
          })
        })
      })

      describe('the "email" property', () => {
        describe('when there is an email', () => {
          it('returns the email', () => {
            const {
              companyContacts: [result]
            } = ContactsPresenter.go(customer, companyContacts)

            expect(result.email).to.equal('rachael.tyrell@tyrellcorp.com')
          })
        })

        describe('when there is no email', () => {
          beforeEach(() => {
            companyContacts[0].contact.email = null
          })

          it('returns null', () => {
            const {
              companyContacts: [result]
            } = ContactsPresenter.go(customer, companyContacts)

            expect(result.email).to.be.null()
          })
        })
      })
    })
  })
})
