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
const FetchAddressService = require('../../../app/services/companies/fetch-address.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewCompanyWithAddressService = require('../../../app/services/companies/view-company-with-address.service.js')

describe('Companies - View Company With Address Service', () => {
  const licenceId = 'fbf2df24-ac78-4ee2-b5bb-eb7f9cf6b59a'

  let address
  let company
  let role

  beforeEach(async () => {
    company = CustomersFixtures.company()
    address = CustomersFixtures.companyAddress().address

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchAddressService, 'go').returns(address)
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
        const result = await ViewCompanyWithAddressService.go(company.id, address.id, role, licenceId)

        expect(result).to.equal({
          backLink: {
            href: `/system/licences/${licenceId}/contact-details`,
            text: 'Go back to licence contact details'
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
    })

    describe('and the role is "returns-to"', () => {
      beforeEach(() => {
        role = 'returns-to'
      })

      it('returns page data for the view', async () => {
        const result = await ViewCompanyWithAddressService.go(company.id, address.id, role, licenceId)

        expect(result).to.equal({
          backLink: {
            href: `/system/licences/${licenceId}/contact-details`,
            text: 'Go back to licence contact details'
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
    })
  })
})
