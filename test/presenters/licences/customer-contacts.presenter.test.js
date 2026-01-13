'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Thing under test
const CustomerContactsPresenter = require('../../../app/presenters/licences/customer-contacts.presenter.js')

describe('Customer Contacts presenter', () => {
  let companyContacts

  beforeEach(() => {
    companyContacts = CustomersFixtures.companyContacts()
  })

  describe('when provided with populated customer contacts data', () => {
    it('correctly presents the data', () => {
      const result = CustomerContactsPresenter.go(companyContacts)

      expect(result).to.equal({
        customerContacts: [
          {
            communicationType: 'Additional Contact',
            email: 'rachael.tyrell@tyrellcorp.com',
            name: 'Rachael Tyrell'
          }
        ]
      })
    })
  })
})
