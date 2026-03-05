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
  const role = 'Licence holder'

  let companyDetails

  beforeEach(() => {
    companyDetails = {
      ...CustomersFixtures.company(),
      companyAddresses: [CustomersFixtures.companyAddress()]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanyPresenter.go(companyDetails, role)

      expect(result).to.equal({
        backLink: {
          href: `/system/companies/${companyDetails.id}/contacts`,
          text: 'Go back to contacts'
        },
        details: {
          address: [
            'The Tyrell Spire',
            'Floor 667 (Above the Smog)',
            'Southbank Industrial Sector',
            'Lambeth Precinct',
            'Greater London',
            'United Kingdom',
            'UK',
            'SE1 7TY'
          ],
          name: 'Tyrell Corporation'
        },
        pageTitle: 'Licence holder',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
