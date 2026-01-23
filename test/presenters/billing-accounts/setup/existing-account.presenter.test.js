'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')

// Thing under test
const ExistingAccountPresenter = require('../../../../app/presenters/billing-accounts/setup/existing-account.presenter.js')

describe('Billing Accounts - Setup - Existing Account presenter', () => {
  let session

  describe('when called for the first time', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount
      }
    })

    it('returns page data for the view', () => {
      const result = ExistingAccountPresenter.go(session)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          { divider: 'or' },
          {
            id: 'new',
            value: 'new',
            text: 'Setup a new account',
            checked: false
          }
        ],
        pageTitle: 'Does this account already exist?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('when called with a saved entry', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
        existingAccount: 'new'
      }
    })

    it('returns page data for the view', () => {
      const result = ExistingAccountPresenter.go(session)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          { divider: 'or' },
          {
            id: 'new',
            value: 'new',
            text: 'Setup a new account',
            checked: true
          }
        ],
        pageTitle: 'Does this account already exist?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })
})
