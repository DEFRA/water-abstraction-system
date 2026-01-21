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
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = CustomersFixtures.licences()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter.go(company, licences)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        licences: [
          {
            endDate: null,
            id: licences[0].id,
            licenceName: 'Between Two Tyrell',
            licenceRef: licences[0].licenceRef,
            startDate: '1 January 2022'
          }
        ],
        pageTitle: 'Licences',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
