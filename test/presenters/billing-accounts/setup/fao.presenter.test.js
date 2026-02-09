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
const FAOPresenter = require('../../../../app/presenters/billing-accounts/setup/fao.presenter.js')

describe('Billing Accounts - Setup - FAO Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
      id: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = FAOPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/existing-address`,
          text: 'Back'
        },
        fao: session.fao ?? null,
        pageTitle: 'Do you need to add an FAO?',
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('the "backLink.href" property', () => {
    describe('when no "addressJourney" exists in the session', () => {
      it('returns the link for the "existing-address" page', () => {
        const result = FAOPresenter.go(session)

        expect(result.backLink.href).to.equal(`/system/billing-accounts/setup/${session.id}/existing-address`)
      })
    })

    describe('when "addressJourney" exists with an "address" and it has a "uprn" in the session', () => {
      beforeEach(() => {
        session.addressJourney = {
          address: { uprn: '123456789' }
        }
      })

      it('returns the link for the "select" address page', () => {
        const result = FAOPresenter.go(session)

        expect(result.backLink.href).to.equal(`/system/address/${session.id}/select`)
      })
    })

    describe('when "addressJourney" exists with an "address" and it has no "uprn" and a "postcode" in the session', () => {
      beforeEach(() => {
        session.addressJourney = {
          address: { postcode: 'SW1A 1AA' }
        }
      })

      it('returns the link for the "manual" address page', () => {
        const result = FAOPresenter.go(session)

        expect(result.backLink.href).to.equal(`/system/address/${session.id}/manual`)
      })
    })

    describe('when "addressJourney" exists with an "address" and it has no "uprn" and a "country" in the session', () => {
      beforeEach(() => {
        session.addressJourney = {
          address: { country: 'France' }
        }
      })

      it('returns the link for the "international" address page', () => {
        const result = FAOPresenter.go(session)

        expect(result.backLink.href).to.equal(`/system/address/${session.id}/international`)
      })
    })
  })
})
