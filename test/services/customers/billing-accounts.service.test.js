'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const BillingAccountsService = require('../../../app/services/customers/billing-accounts.service.js')

describe('Customers - Billing Accounts Service', () => {
  let customerId

  beforeEach(async () => {
    customerId = generateUUID()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await BillingAccountsService.go(customerId)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'billing-accounts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Billing accounts'
      })
    })
  })
})
