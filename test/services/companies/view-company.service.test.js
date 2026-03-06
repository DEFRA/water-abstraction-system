'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const CompanyPresenter = require('../../../app/presenters/companies/company.presenter.js')

// Things we need to stub
const FetchCompanyDetailsService = require('../../../app/services/companies/fetch-company-details.service.js')

// Thing under test
const ViewCompanyService = require('../../../app/services/companies/view-company.service.js')

describe('Companies - Company Service', () => {
  let companyDetails
  let role

  beforeEach(async () => {
    companyDetails = {
      ...CustomersFixtures.company(),
      companyAddresses: [CustomersFixtures.companyAddress()]
    }

    Sinon.stub(FetchCompanyDetailsService, 'go').returns(companyDetails)

    Sinon.spy(CompanyPresenter, 'go')
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
          details: {
            address: [
              'The Tyrell Spire',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'SE1 7TY',
              'UK'
            ],
            name: 'Tyrell Corporation'
          },
          pageTitle: 'Licence holder',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })

      it('should call the fetch with role converted to camel case', async () => {
        await ViewCompanyService.go(companyDetails.id, role)

        expect(FetchCompanyDetailsService.go.calledWith(companyDetails.id, 'licenceHolder')).to.be.true()
      })

      it('should call the presenter with role converted to sentence case', async () => {
        await ViewCompanyService.go(companyDetails.id, role)

        expect(CompanyPresenter.go.calledWith(companyDetails, 'Licence holder')).to.be.true()
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
          details: {
            address: [
              'The Tyrell Spire',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'SE1 7TY',
              'UK'
            ],
            name: 'Tyrell Corporation'
          },
          pageTitle: 'Returns to',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })

      it('should call the fetch with role converted to camel case', async () => {
        await ViewCompanyService.go(companyDetails.id, role)

        expect(FetchCompanyDetailsService.go.calledWith(companyDetails.id, 'returnsTo')).to.be.true()
      })

      it('should call the presenter with role converted to sentence case', async () => {
        await ViewCompanyService.go(companyDetails.id, role)

        expect(CompanyPresenter.go.calledWith(companyDetails, 'Returns to')).to.be.true()
      })
    })
  })
})
