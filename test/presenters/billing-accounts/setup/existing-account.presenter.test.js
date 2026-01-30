'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')

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

  describe('"items" property', () => {
    describe('when a previous option was selected', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          id: generateUUID(),
          existingAccount: 'new'
        }
      })

      it('the checked property should be true', () => {
        const result = ExistingAccountPresenter.go(session, exampleSearchResults)

        expect(result.items[2].checked).to.equal(true)
      })
    })

    describe('when a previous option was not selected', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          id: generateUUID(),
          existingAccount: null
        }
      })

      it('each of the checked properties should be false', () => {
        const result = ExistingAccountPresenter.go(session, exampleSearchResults)

        expect(result.items).to.equal([
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
        ])
      })
    })
  })

  describe('"pageTitle" property', () => {
    describe('when there are companies returned', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          searchInput: 'Company'
        }
      })

      it('returns the correct page title', () => {
        const result = ExistingAccountPresenter.go(session, exampleSearchResults)

        expect(result.pageTitle).to.equal('Does this account already exist?')
      })
    })

    describe('when there are no companies returned', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          searchInput: 'Company'
        }
      })

      it('returns the correct page title', () => {
        const result = ExistingAccountPresenter.go(session, [])

        expect(result.pageTitle).to.equal(`No search results found for "${session.searchInput}"`)
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
