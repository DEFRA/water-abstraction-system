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
  const addresses = BillingAccountsFixture.billingAccount().billingAccount.billingAccountAddresses
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ExistingAddressPresenter.go(session, addresses)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/account`,
          text: 'Back'
        },
        items: [
          {
            id: addresses[0].address.id,
            value: addresses[0].address.id,
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
        pageTitle: `Select an existing address for ${session.billingAccount.company.name}`,
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
        const result = ExistingAddressPresenter.go(session, addresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/account`)
      })
    })

    describe('when the "accountType" exists in the session as "company"', () => {
      beforeEach(() => {
        session.accountType = 'company'
      })

      it('returns the link for the "account" page', () => {
        const result = ExistingAddressPresenter.go(session, addresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/select-company`)
      })
    })

    describe('when the "accountType" exists in the session as "individual"', () => {
      beforeEach(() => {
        session.accountType = 'individual'
      })

      it('returns the link for the "account-type" page', () => {
        const result = ExistingAddressPresenter.go(session, addresses)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/account-type`)
      })
    })
  })
})
