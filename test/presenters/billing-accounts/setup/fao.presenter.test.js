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

    describe('when "addressJourney" exists and it has a "backUrl" in the session', () => {
      beforeEach(() => {
        session.addressJourney = {
          backUrl: `/system/address/${session.id}/select`
        }
      })

      it('returns that link', () => {
        const result = FAOPresenter.go(session)

        expect(result.backLink.href).to.equal(`/system/address/${session.id}/select`)
      })
    })
  })
})
