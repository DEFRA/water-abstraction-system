'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Thing under test
const LicencesPresenter = require('../../../app/presenters/customers/licences.presenter.js')

describe('Customers - Licences Presenter', () => {
  let customer

  beforeEach(() => {
    customer = CustomersFixtures.customer()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter.go(customer)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Licences',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
