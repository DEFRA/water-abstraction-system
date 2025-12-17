'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BillingAccountsPresenter = require('../../../app/presenters/customers/billing-accounts.presenter.js')

describe('Customers - Billing Accounts Presenter', () => {
  let billingAccounts

  beforeEach(() => {
    billingAccounts = []
  })
  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = BillingAccountsPresenter.go(billingAccounts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Billing accounts'
      })
    })
  })
})
