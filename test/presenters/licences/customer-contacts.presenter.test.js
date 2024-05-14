'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CustomerContactsPresenter = require('../../../app/presenters/licences/customer-contacts.presenter.js')

describe('Customer Contacts presenter', () => {
  let customerContacts

  beforeEach(() => {
    customerContacts = [
      {
        email: 'dfd@email.com',
        firstName: 'Donald',
        lastName: 'Duck',
        middleInitials: null,
        initials: null,
        salutation: null,
        suffix: null,
        communicationType: 'Additional Contact'
      }
    ]
  })

  describe('when provided with populated customer contacts data', () => {
    it('correctly presents the data', () => {
      const result = CustomerContactsPresenter.go(customerContacts)

      expect(result).to.equal({
        customerContacts: [
          {
            communicationType: 'Additional Contact',
            email: 'dfd@email.com',
            name: 'Donald Duck'
          }
        ]
      })
    })

    describe("the 'customerContacts.name' property", () => {
      describe('when the customer contact has salutation, first name, middle initials, last name and suffix', () => {
        beforeEach(() => {
          customerContacts[0].salutation = 'Mrs'
          customerContacts[0].firstName = 'Malary'
          customerContacts[0].middleInitials = 'd d'
          customerContacts[0].suffix = 'Sr'
          customerContacts[0].lastName = 'Duck'
        })
        it("returns the customers contact's name", () => {
          const result = CustomerContactsPresenter.go(customerContacts)

          expect(result.customerContacts[0].name).to.equal('Mrs Malary d d Duck Sr')
        })
      })

      describe('when the customer contact has \'initials\'', () => {
        beforeEach(() => {
          customerContacts[0].initials = 'd'
        })
        it("returns the customers contact's name", () => {
          const result = CustomerContactsPresenter.go(customerContacts)

          expect(result.customerContacts[0].name).to.equal('Donald d Duck')
        })
      })

      describe('when the customer contact has \'middleInitials\'', () => {
        beforeEach(() => {
          customerContacts[0].middleInitials = 'm i'
        })
        it("returns the customers contact's name", () => {
          const result = CustomerContactsPresenter.go(customerContacts)

          expect(result.customerContacts[0].name).to.equal('Donald m i Duck')
        })
      })

      describe('when the customer contact has first name and last name', () => {
        beforeEach(() => {
          customerContacts[0].firstName = 'Malary'
          customerContacts[0].lastName = 'Duck'
        })
        it("returns the customers contact's name", () => {
          const result = CustomerContactsPresenter.go(customerContacts)

          expect(result.customerContacts[0].name).to.equal('Malary Duck')
        })
      })
    })
  })
})
