'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')

// Thing under test
const CompanyNamePresenter = require('../../../../app/presenters/billing-accounts/setup/company-name.presenter.js')

describe('Billing Accounts - Setup - Company Name Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanyNamePresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account-type`,
          text: 'Back'
        },
        companyName: null,
        pageTitle: 'Enter the company details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "companyName" property', () => {
    describe('when no company name has been entered', () => {
      it('returns null', () => {
        const result = CompanyNamePresenter.go(session)

        expect(result.companyName).to.equal(null)
      })
    })

    describe('when a company name has been entered', () => {
      beforeEach(() => {
        session.companyName = 'Company Name'
      })

      it('returns the selected contact name', () => {
        const result = CompanyNamePresenter.go(session)

        expect(result.companyName).to.equal(session.companyName)
      })
    })
  })
})
