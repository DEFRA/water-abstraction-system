'use strict'

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')

// Thing under test
const AccountPresenter = require('../../../../app/presenters/billing-accounts/setup/account.presenter.js')

describe('Billing Accounts - Setup - Account Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AccountPresenter(session)

      expect(result).toEqual({
        accountSelected: null,
        backLink: {
          href: `/system/billing-accounts/${session.billingAccount.id}`,
          text: 'Back'
        },
        companyId: session.billingAccount.company.id,
        companyName: session.billingAccount.company.name,
        pageTitle: 'Who should the bills go to?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchInput: null
      })
    })
  })

  describe('when called with a search input', () => {
    beforeEach(() => {
      session.accountSelected = 'another'
      session.searchInput = 'Company Name'
    })

    it('returns page data for the view', () => {
      const result = AccountPresenter(session)

      expect(result).toEqual({
        accountSelected: 'another',
        backLink: {
          href: `/system/billing-accounts/${session.billingAccount.id}`,
          text: 'Back'
        },
        companyId: session.billingAccount.company.id,
        companyName: session.billingAccount.company.name,
        pageTitle: 'Who should the bills go to?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchInput: 'Company Name'
      })
    })
  })

  describe('when called with existing customer', () => {
    beforeEach(() => {
      session.accountSelected = 'customer'
    })

    it('returns page data for the view', () => {
      const result = AccountPresenter(session)

      expect(result).toEqual({
        accountSelected: 'customer',
        backLink: {
          href: `/system/billing-accounts/${session.billingAccount.id}`,
          text: 'Back'
        },
        companyId: session.billingAccount.company.id,
        companyName: session.billingAccount.company.name,
        pageTitle: 'Who should the bills go to?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchInput: null
      })
    })
  })
})
