'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/billing-accounts/setup/check.presenter.js')

describe('Billing Accounts - Setup - Check Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        accountSelected: 'Another billing account',
        links: {
          accountSelected: `/system/billing-accounts/setup/${session.id}/account`
        },
        pageTitle: 'Check billing account details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchInput: ''
      })
    })
  })

  describe('the "accountSelected" property', () => {
    describe('when called with the "accountSelected" set to "customer"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go({
          ...session,
          accountSelected: 'customer'
        })

        expect(result.accountSelected).to.equal(session.billingAccount.company.name)
      })
    })

    describe('when called with the "accountSelected" set to "another"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go({
          ...session,
          accountSelected: 'another'
        })

        expect(result.accountSelected).to.equal('Another billing account')
      })
    })
  })

  describe('the "searchInput" property', () => {
    describe('when called with the "searchInput" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter.go({
          ...session,
          searchInput: 'Customer name'
        })

        expect(result.searchInput).to.equal('Customer name')
      })
    })

    describe('when called with the "searchInput" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go({
          ...session,
          searchInput: null
        })

        expect(result.searchInput).to.equal('')
      })
    })
  })
})
