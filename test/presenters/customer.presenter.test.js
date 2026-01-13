'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../fixtures/customers.fixture.js')

// Thing under test
const CustomerPresenter = require('../../app/presenters/customer.presenter.js')

describe('Customer presenter', () => {
  describe('#companyContact', () => {
    let companyContact

    beforeEach(() => {
      const companyContacts = CustomersFixtures.companyContacts()

      companyContact = companyContacts[0]
    })

    it('returns the company contact', () => {
      const result = CustomerPresenter.companyContact(companyContact)

      expect(result).to.equal({
        communicationType: 'Additional Contact',
        email: 'rachael.tyrell@tyrellcorp.com',
        name: 'Rachael Tyrell'
      })
    })

    describe('the "communicationType" property', () => {
      describe('when the company contact is marked for abstraction alerts', () => {
        beforeEach(() => {
          companyContact.abstractionAlerts = true
        })

        it('returns the string "Water abstraction alerts"', () => {
          const result = CustomerPresenter.companyContact(companyContact)

          expect(result.communicationType).to.equal('Water abstraction alerts')
        })
      })

      describe('when the company contact is not marked for abstraction alerts', () => {
        it('returns the licence role', () => {
          const result = CustomerPresenter.companyContact(companyContact)

          expect(result.communicationType).to.equal('Additional Contact')
        })
      })
    })

    describe('the "email" property', () => {
      describe('when there is an email', () => {
        it('returns the email', () => {
          const result = CustomerPresenter.companyContact(companyContact)

          expect(result.email).to.equal('rachael.tyrell@tyrellcorp.com')
        })
      })

      describe('when there is no email', () => {
        beforeEach(() => {
          companyContact.contact.email = null
        })

        it('returns null', () => {
          const result = CustomerPresenter.companyContact(companyContact)

          expect(result.email).to.be.null()
        })
      })
    })
  })
})
