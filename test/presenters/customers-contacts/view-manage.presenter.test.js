'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Thing under test
const ViewManagePresenter = require('../../../app/presenters/customers-contacts/view-manage.presenter.js')

describe('Customers contacts - View Manage Presenter', () => {
  let companyContact
  let company

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.customer()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewManagePresenter.go(company, companyContact)

      expect(result).to.equal({
        backLink: {
          href: `/system/customers/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          name: 'Rachael Tyrell'
        },
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/customers-contacts/${companyContact.id}/remove`
      })
    })
  })
})
