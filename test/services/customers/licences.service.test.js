'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../fixtures/customers.fixture.js')

// Things we need to stub
const FetchCustomerService = require('../../../app/services/customers/fetch-customer.service.js')

// Thing under test
const LicencesService = require('../../../app/services/customers/licences.service.js')

describe('Customers - Licences Service', () => {
  let customer

  beforeEach(async () => {
    customer = CustomersFixtures.customer()

    Sinon.stub(FetchCustomerService, 'go').returns(customer)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicencesService.go(customer.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'licences',
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
