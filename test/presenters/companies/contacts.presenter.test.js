'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ContactsPresenter = require('../../../app/presenters/companies/contacts.presenter.js')

describe('Companies - Contacts presenter', () => {
  let company
  let companyContacts

  beforeEach(() => {
    company = CustomersFixtures.company()

    companyContacts = CustomersFixtures.companyContacts()

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerManage').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter.go(company, companyContacts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        companyContacts: [
          {
            action: `/system/company-contacts/${companyContacts[0].id}`,
            communicationType: 'Additional Contact',
            name: 'Rachael Tyrell',
            email: 'rachael.tyrell@tyrellcorp.com'
          }
        ],
        links: {
          createContact: `/customer/${company.id}/contacts/new`
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
