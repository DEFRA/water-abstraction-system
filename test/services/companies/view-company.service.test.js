'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const FetchCompanyDetailsService = require('../../../app/services/companies/fetch-company-details.service.js')

// Thing under test
const ViewCompanyService = require('../../../app/services/companies/view-company.service.js')

describe('Companies - View Company Service', () => {
  let companyDetails
  let role

  beforeEach(async () => {
    companyDetails = {
      ...CustomersFixtures.company(),
      companyAddresses: []
    }

    let companyAddress = CustomersFixtures.companyAddress()

    companyAddress.startDate = new Date('2021-04-01')
    companyAddress.address.country = null
    companyDetails.companyAddresses.push({ ...companyAddress })

    Sinon.stub(FetchCompanyDetailsService, 'go').returns(companyDetails)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the role is "licence-holder"', () => {
      beforeEach(() => {
        role = 'licence-holder'
      })

      it('returns page data for the view', async () => {
        const result = await ViewCompanyService.go(companyDetails.id, role)

        expect(result).to.equal({
          backLink: {
            href: `/system/companies/${companyDetails.id}/contacts`,
            text: 'Go back to contacts'
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
            }
          ],
          pageTitle: 'Licence holder',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })

      it('calls the fetch service with role converted to camelCase', async () => {
        await ViewCompanyService.go(companyDetails.id, role)

        expect(FetchCompanyDetailsService.go.calledWith(companyDetails.id, 'licenceHolder')).to.be.true()
      })
    })

    describe('and the role is "returns-to"', () => {
      beforeEach(() => {
        role = 'returns-to'
      })

      it('returns page data for the view', async () => {
        const result = await ViewCompanyService.go(companyDetails.id, role)

        expect(result).to.equal({
          backLink: {
            href: `/system/companies/${companyDetails.id}/contacts`,
            text: 'Go back to contacts'
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
            }
          ],
          pageTitle: 'Returns to',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })

      it('calls the fetch service with role converted to camelCase', async () => {
        await ViewCompanyService.go(companyDetails.id, role)

        expect(FetchCompanyDetailsService.go.calledWith(companyDetails.id, 'returnsTo')).to.be.true()
      })
    })
  })
})
