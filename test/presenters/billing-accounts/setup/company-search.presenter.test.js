// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'

// Thing under test
import CompanySearchPresenter from '../../../../app/presenters/billing-accounts/setup/company-search.presenter.js'

describe('Billing Accounts - Setup - Company Search Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanySearchPresenter(session)

      expect(result).toEqual({
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
    describe('when no company search value has been entered', () => {
      it('returns null', () => {
        const result = CompanySearchPresenter(session)

        expect(result.companySearch).toBeNull()
      })
    })

    describe('when a company search value has been entered', () => {
      beforeEach(() => {
        session.companySearch = 'Company Name'
      })

      it('returns the company search value', () => {
        const result = CompanySearchPresenter(session)

        expect(result.companySearch).toEqual(session.companySearch)
      })
    })
  })
})
