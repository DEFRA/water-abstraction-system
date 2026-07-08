'use strict'

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ExistingAccountPresenter = require('../../../../app/presenters/billing-accounts/setup/existing-account.presenter.js')

describe('Billing Accounts - Setup - Existing Account presenter', () => {
  const companies = CustomersFixture.companies()

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
      const result = ExistingAccountPresenter(session, companies)

      expect(result).toEqual({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: companies[0].id,
            value: companies[0].id,
            text: companies[0].name,
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
        const result = ExistingAccountPresenter(session, companies)

        expect(result.items[2].checked).toEqual(true)
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
        const result = ExistingAccountPresenter(session, companies)

        expect(result.items).toEqual([
          {
            id: companies[0].id,
            value: companies[0].id,
            text: companies[0].name,
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
        const result = ExistingAccountPresenter(session, companies)

        expect(result.pageTitle).toEqual('Does this account already exist?')
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
        const result = ExistingAccountPresenter(session, [])

        expect(result.pageTitle).toEqual(`No search results found for "${session.searchInput}"`)
      })
    })
  })

  describe('"backLink" property', () => {
    describe('when check page has not been visited', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          searchInput: 'Company'
        }
      })

      it('returns the correct back link', () => {
        const result = ExistingAccountPresenter(session, companies)

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/account`)
      })
    })

    describe('when check page has been visited', () => {
      beforeEach(() => {
        session = {
          billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
          checkPageVisited: true,
          searchInput: 'Company'
        }
      })

      it('returns the correct back link', () => {
        const result = ExistingAccountPresenter(session, [])

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })
  })
})
