// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import FAOPresenter from '../../../../app/presenters/billing-accounts/setup/fao.presenter.js'

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
      const result = FAOPresenter(session)

      expect(result).toEqual({
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
    describe('when no "checkPageVisited" is not set', () => {
      it('returns the link for the "existing-address" page', () => {
        const result = FAOPresenter(session)

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/existing-address`)
      })
    })

    describe('when "checkPageVisited" is true', () => {
      it('returns the link for the "check" page', () => {
        const result = FAOPresenter({
          ...session,
          checkPageVisited: true
        })

        expect(result.backLink.href).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })
  })
})
