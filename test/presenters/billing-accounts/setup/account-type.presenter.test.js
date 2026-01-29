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
      const result = AccountTypePresenter.go(session)

      expect(result).to.equal({
        accountType: null,
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/existing-account`,
          text: 'Back'
        },
        pageTitle: 'Select the account type',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchIndividualInput: null
      })
    })
  })

  describe('the "accountType" property', () => {
    describe('when called with an existing "accountType" of company', () => {
      beforeEach(() => {
        session.accountType = 'company'
      })

      it('returns page data for the view', () => {
        const result = AccountTypePresenter.go(session)

        expect(result.accountType).to.equal(session.accountType)
      })
    })

    describe('when called with existing "accountType" of individual with a search input', () => {
      beforeEach(() => {
        session.accountType = 'individual'
        session.searchIndividualInput = 'John Doe'
      })

      it('returns page data for the view', () => {
        const result = AccountTypePresenter.go(session)

        expect(result.accountType).to.equal(session.accountType)
        expect(result.searchIndividualInput).to.equal(session.searchIndividualInput)
      })
    })
  })
})
