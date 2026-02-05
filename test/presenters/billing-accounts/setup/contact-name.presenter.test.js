'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')

// Thing under test
const ContactNamePresenter = require('../../../../app/presenters/billing-accounts/setup/contact-name.presenter.js')

describe('Billing Accounts - Setup - Contact Name Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactNamePresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/contact`,
          text: 'Back'
        },
        contactName: null,
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "contactName" property', () => {
    describe('when no contact has been selected', () => {
      it('returns null', () => {
        const result = ContactNamePresenter.go(session)

        expect(result.contactName).to.equal(null)
      })
    })

    describe('when a contact has been selected', () => {
      beforeEach(() => {
        session.contactName = 'Contact Name'
      })

      it('returns the selected contact name', () => {
        const result = ContactNamePresenter.go(session)

        expect(result.contactName).to.equal(session.contactName)
      })
    })
  })
})
