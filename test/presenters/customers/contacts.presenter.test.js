'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactsPresenter = require('../../../app/presenters/customers/contacts.presenter.js')

describe('Customers - Contacts Presenter', () => {
  let contacts

  beforeEach(() => {
    contacts = []
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter.go(contacts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Contacts'
      })
    })
  })
})
