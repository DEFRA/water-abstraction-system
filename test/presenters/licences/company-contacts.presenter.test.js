'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const CompanyContactsPresenter = require('../../../app/presenters/licences/company-contacts.presenter.js')

describe('Company Contacts presenter', () => {
  let companyContacts

  beforeEach(() => {
    companyContacts = CustomersFixtures.companyContacts()
  })

  describe('when provided with populated company contacts data', () => {
    it('correctly presents the data', () => {
      const result = CompanyContactsPresenter.go(companyContacts)

      expect(result).to.equal({
        companyContacts: [
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
