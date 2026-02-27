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
const ExistingAddressPresenter = require('../../../../app/presenters/billing-accounts/setup/existing-address.presenter.js')

describe('Billing Accounts - Setup - Existing Address Presenter', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const companyAddresses = {
    company: billingAccount.company,
    addresses: [billingAccount.billingAccountAddresses[0].address]
  }

  let session

  beforeEach(() => {
    session = {
      billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ExistingAddressPresenter.go(session, companyAddresses)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: companyAddresses.addresses[0].id,
            value: companyAddresses.addresses[0].id,
            text: 'Tutsham Farm, West Farleigh, Maidstone, Kent, ME15 0NE',
            checked: false
          },
          { divider: 'or' },
          {
            id: 'new',
            value: 'new',
            text: 'Setup a new address',
            checked: false
          }
        ],
        pageTitle: `Select an existing address for ${companyAddresses.company.name}`,
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "backLink.href" property', () => {
    describe('when there is no "accountType" and "existingAccount" is a UUID', () => {
      beforeEach(() => {
        session.existingAccount = generateUUID()
      })

      it('returns the link for the "account" page', () => {
        const result = ExistingAddressPresenter.go(session, companyAddresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/existing-account`)
      })
    })

    describe('when the "accountType" exists in the session as "company"', () => {
      beforeEach(() => {
        session.accountType = 'company'
      })

      it('returns the link for the "account" page', () => {
        const result = ExistingAddressPresenter.go(session, companyAddresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/select-company`)
      })
    })

    describe('when the "accountType" exists in the session as "individual"', () => {
      beforeEach(() => {
        session.accountType = 'individual'
      })

      it('returns the link for the "account-type" page', () => {
        const result = ExistingAddressPresenter.go(session, companyAddresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/account-type`)
      })
    })

    describe('when "accountType" and "existingAccount" are null in the session', () => {
      beforeEach(() => {
        session.accountType = null
        session.existingAccount = null
      })

      it('returns the link for the "account-type" page', () => {
        const result = ExistingAddressPresenter.go(session, companyAddresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/account`)
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when there are addresses in the companyAddresses object', () => {
      it('returns the correct page title', () => {
        const result = ExistingAddressPresenter.go(session, companyAddresses)

        expect(result.pageTitle).to.equal(`Select an existing address for ${companyAddresses.company.name}`)
      })
    })

    describe('when there are no addresses in the companyAddresses object', () => {
      beforeEach(() => {
        companyAddresses.addresses = []
      })

      it('returns the correct page title', () => {
        const result = ExistingAddressPresenter.go(session, companyAddresses)

        expect(result.pageTitle).to.equal(`No addresses found for ${companyAddresses.company.name}`)
      })
    })
  })
})
