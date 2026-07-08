'use strict'

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')

// Thing under test
const ContactNamePresenter = require('../../../../app/presenters/billing-accounts/setup/contact-name.presenter.js')

describe('Billing Accounts - Setup - Contact Name Presenter', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  let session

  beforeEach(() => {
    session = {
      billingAccount
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactNamePresenter(session)

      expect(result).toEqual({
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
        const result = ContactNamePresenter(session)

        expect(result.contactName).toEqual(null)
      })
    })

    describe('when a contact has been selected', () => {
      beforeEach(() => {
        session.contactName = 'Contact Name'
      })

      it('returns the selected contact name', () => {
        const result = ContactNamePresenter(session)

        expect(result.contactName).toEqual(session.contactName)
      })
    })
  })

  describe('"backLink" property', () => {
    describe('when check page has not been visited', () => {
      beforeEach(() => {
        session = {
          billingAccount,
          contactName: 'Contact Name'
        }
      })

      it('returns the correct back link', () => {
        const result = ContactNamePresenter(session)

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/contact`)
      })
    })

    describe('when check page has been visited', () => {
      beforeEach(() => {
        session = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }
      })

      it('returns the correct back link', () => {
        const result = ContactNamePresenter(session)

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })
  })
})
