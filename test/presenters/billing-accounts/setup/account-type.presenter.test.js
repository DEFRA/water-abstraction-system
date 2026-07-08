'use strict'

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const AccountTypePresenter = require('../../../../app/presenters/billing-accounts/setup/account-type.presenter.js')

describe('Billing Accounts - Setup - Account Type Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AccountTypePresenter(session)

      expect(result).toEqual({
        accountType: null,
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/existing-account`,
          text: 'Back'
        },
        pageTitle: 'Select the account type',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        individualName: null
      })
    })
  })

  describe('the "accountType" property', () => {
    describe('when called with an existing "accountType" of company', () => {
      beforeEach(() => {
        session.accountType = 'company'
      })

      it('returns page data for the view', () => {
        const result = AccountTypePresenter(session)

        expect(result.accountType).toEqual(session.accountType)
      })
    })

    describe('when called with existing "accountType" of individual with a search input', () => {
      beforeEach(() => {
        session.accountType = 'individual'
        session.individualName = 'John Doe'
      })

      it('returns page data for the view', () => {
        const result = AccountTypePresenter(session)

        expect(result.accountType).toEqual(session.accountType)
        expect(result.individualName).toEqual(session.individualName)
      })
    })
  })
})
