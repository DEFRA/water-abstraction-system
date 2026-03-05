'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const CompanyPresenter = require('../../../app/presenters/companies/company.presenter.js')

describe('Companies - Company Presenter', () => {
  let company

  beforeEach(() => {
    company = CustomersFixtures.company()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanyPresenter.go(company)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Company',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
