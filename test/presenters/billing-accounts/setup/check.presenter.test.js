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
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: [billingAccount.billingAccountAddresses[0].address]
  }

  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session, companyAddresses)

      expect(result).to.equal({
        accountSelected: 'Another billing account',
        accountType: '',
        existingAccount: '',
        links: {
          accountSelected: `/system/billing-accounts/setup/${session.id}/account`,
          accountType: `/system/billing-accounts/setup/${session.id}/account-type`,
          existingAccount: `/system/billing-accounts/setup/${session.id}/existing-account`
        },
        pageTitle: 'Check billing account details',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
        searchIndividualInput: '',
        searchInput: ''
      })
    })
  })

  describe('the "accountSelected" property', () => {
    describe('when called with the "accountSelected" set to "customer"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountSelected: 'customer'
          },
          companyAddresses
        )

        expect(result.accountSelected).to.equal(session.billingAccount.company.name)
      })
    })

    describe('when called with the "accountSelected" set to "another"', () => {
      it('returns the name from the billing account', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountSelected: 'another'
          },
          companyAddresses
        )

        expect(result.accountSelected).to.equal('Another billing account')
      })
    })
  })

  describe('the "searchInput" property', () => {
    describe('when called with the "searchInput" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchInput: 'Customer name'
          },
          companyAddresses
        )

        expect(result.searchInput).to.equal('Customer name')
      })
    })

    describe('when called with the "searchInput" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchInput: null
          },
          companyAddresses
        )

        expect(result.searchInput).to.equal('')
      })
    })
  })

  describe('the "existingAccount" property', () => {
    describe('when called with the "existingAccount" set to new', () => {
      it('returns "New billing account"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            existingAccount: 'new'
          },
          companyAddresses
        )

        expect(result.existingAccount).to.equal('New billing account')
      })
    })

    describe('when called with the "existingAccount" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            existingAccount: null
          },
          companyAddresses
        )

        expect(result.existingAccount).to.equal('')
      })
    })

    describe('when called with the "existingAccount" set to an existing comapny id', () => {
      it('returns the name of that company', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            existingAccount: billingAccount.company.id
          },
          companyAddresses
        )

        expect(result.existingAccount).to.equal('Ferns Surfacing Limited')
      })
    })
  })

  describe('the "accountType" property', () => {
    describe('when called with the "accountType" set to "company"', () => {
      it('returns "company"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountType: 'company'
          },
          companyAddresses
        )

        expect(result.accountType).to.equal('company')
      })
    })

    describe('when called with the "accountType" set to "individual"', () => {
      it('returns "individual"', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            accountType: 'individual'
          },
          companyAddresses
        )

        expect(result.accountType).to.equal('individual')
      })
    })
  })

  describe('the "searchIndividualInput" property', () => {
    describe('when called with the "searchIndividualInput" set', () => {
      it('returns the saved search input', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchIndividualInput: 'Customer name'
          },
          companyAddresses
        )

        expect(result.searchIndividualInput).to.equal('Customer name')
      })
    })

    describe('when called with the "searchIndividualInput" set to null', () => {
      it('returns an empty string', () => {
        const result = CheckPresenter.go(
          {
            ...session,
            searchIndividualInput: null
          },
          companyAddresses
        )

        expect(result.searchIndividualInput).to.equal('')
      })
    })
  })
})
