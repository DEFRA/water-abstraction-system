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
    customerContacts = []
  })

  describe('when provided with populated licence contacts data', () => {
    it('correctly presents the data', () => {
      const result = CustomerContactsPresenter.go(customerContacts)

      expect(result).to.equal({ customerContacts: [] })
    })
  })
})
