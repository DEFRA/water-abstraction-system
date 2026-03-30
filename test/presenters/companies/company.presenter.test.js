'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const { formatLongDate } = require('../../../app/presenters/base.presenter.js')
const { tomorrow } = require('../../support/general.js')

// Thing under test
const CompanyPresenter = require('../../../app/presenters/companies/company.presenter.js')

describe('Companies - Company Presenter', () => {
  const role = 'licence-holder'

  let companyDetails

  beforeEach(() => {
    companyDetails = {
      ...CustomersFixtures.company(),
      companyAddresses: []
    }

    let companyAddress = CustomersFixtures.companyAddress()

    companyAddress.startDate = new Date('2021-04-01')
    companyAddress.address.country = null
    companyDetails.companyAddresses.push({ ...companyAddress })

    companyAddress = CustomersFixtures.companyAddress()

    companyAddress.address.address1 = 'The Tyrell Plaza'
    companyAddress.startDate = new Date('2022-04-01')
    companyAddress.endDate = tomorrow()
    companyDetails.companyAddresses.push({ ...companyAddress })
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanyPresenter.go(companyDetails, role)

      expect(result).to.equal({
        backLink: {
          href: `/system/companies/${companyDetails.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        companyAddresses: [
          {
            address: [
              'The Tyrell Spire',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'United Kingdom',
              'SE1 7TY'
            ],
            endDate: null,
            startDate: '1 April 2021'
          },
          {
            address: [
              'The Tyrell Plaza',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'United Kingdom',
              'SE1 7TY',
              'UK'
            ],
            endDate: formatLongDate(tomorrow()),
            startDate: '1 April 2022'
          }
        ],
        pageTitle: 'Licence holder',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "companyAddresses" property', () => {
      describe('the "address" property', () => {
        describe('when all properties of the address are present', () => {
          it('returns an array of all address properties', () => {
            const result = CompanyPresenter.go(companyDetails, role)

            expect(result.companyAddresses[1].address).to.equal([
              'The Tyrell Plaza',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'United Kingdom',
              'SE1 7TY',
              'UK'
            ])
          })
        })

        describe('when some properties of the address are missing', () => {
          it('returns an array of the address properties that are present', () => {
            const result = CompanyPresenter.go(companyDetails, role)

            expect(result.companyAddresses[0].address).to.equal([
              'The Tyrell Spire',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'United Kingdom',
              'SE1 7TY'
            ])
          })
        })
      })
    })
  })
})
