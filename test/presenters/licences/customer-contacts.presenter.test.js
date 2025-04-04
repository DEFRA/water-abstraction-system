'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
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
  })
})
