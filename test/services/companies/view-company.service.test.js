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
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')

// Thing under test
const ViewCompanyService = require('../../../app/services/companies/view-company.service.js')

describe('Companies - Company Service', () => {
  let company

  beforeEach(async () => {
    company = CustomersFixtures.company()

    Sinon.stub(FetchCompanyService, 'go').returns(company)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCompanyService.go(company.id)

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
