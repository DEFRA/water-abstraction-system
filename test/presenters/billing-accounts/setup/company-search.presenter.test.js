'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')

// Thing under test
const CompanySearchPresenter = require('../../../../app/presenters/billing-accounts/setup/company-search.presenter.js')

describe('Billing Accounts - Setup - Company Name Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanySearchPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account-type`,
          text: 'Back'
        },
        companySearch: null,
        pageTitle: 'Enter the company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "companySearch" property', () => {
    describe('when no company name has been entered', () => {
      it('returns null', () => {
        const result = CompanySearchPresenter.go(session)

        expect(result.companySearch).to.equal(null)
      })
    })

    describe('when a company name has been entered', () => {
      beforeEach(() => {
        session.companySearch = 'Company Name'
      })

      it('returns the selected contact name', () => {
        const result = CompanySearchPresenter.go(session)

        expect(result.companySearch).to.equal(session.companySearch)
      })
    })
  })
})
