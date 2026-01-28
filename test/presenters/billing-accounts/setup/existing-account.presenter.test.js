'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')

// Thing under test
const ExistingAccountPresenter = require('../../../../app/presenters/billing-accounts/setup/existing-account.presenter.js')

describe('Billing Accounts - Setup - Existing Account presenter', () => {
  const exampleSearchResults = _companies()
  let session

  describe('when called for the first time', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
        id: generateUUID(),
        searchInput: 'Company Name'
      }
    })

    it('returns page data for the view', () => {
      const result = ExistingAccountPresenter.go(session, exampleSearchResults)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: exampleSearchResults[0].id,
            value: exampleSearchResults[0].id,
            text: exampleSearchResults[0].name,
            checked: false
          },
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

  describe('when called and no companies were found', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
        id: generateUUID(),
        searchInput: 'Company Name'
      }
    })

    it('returns page data for the view', () => {
      const result = ExistingAccountPresenter.go(session, [])

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [],
        pageTitle: `No search results found for "${session.searchInput}"`,
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
      const result = ExistingAccountPresenter.go(session, exampleSearchResults)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: exampleSearchResults[0].id,
            value: exampleSearchResults[0].id,
            text: exampleSearchResults[0].name,
            checked: false
          },
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

function _companies() {
  return [
    {
      id: generateUUID(),
      name: 'Company Name Ltd'
    }
  ]
}
