// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as BillingAccountsFixture from '../../../support/fixtures/billing-accounts.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitFAOService from '../../../../app/services/billing-accounts/setup/submit-fao.service.js'

describe('Billing Accounts - Setup - Submit FAO Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const billingAccountAddress = billingAccount.billingAccountAddresses[0].address
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      addressSelected: billingAccountAddress.id,
      billingAccount
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a "yes" value', () => {
    beforeEach(() => {
      payload = {
        fao: 'yes'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitFAOService(session.id, payload)

      expect(session).toMatchObject({
        fao: 'yes'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitFAOService(session.id, payload)

      expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/contact`)
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          fao: 'yes'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          fao: 'yes'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/contact`)
      })
    })

    describe('and the user has returned from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          fao: 'yes'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          checkPageVisited: true,
          fao: 'yes'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user had previously completed the "no" journey', () => {
      beforeEach(() => {
        sessionData = {
          addressJourney: _addressJourney(session),
          billingAccount,
          fao: 'no'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: null,
          checkPageVisited: false,
          contactName: null,
          contactSelected: null,
          fao: 'yes'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/contact`)
      })
    })
  })

  describe('when called with a "no" value', () => {
    beforeEach(() => {
      payload = {
        fao: 'no'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitFAOService(session.id, payload)

      expect(session).toMatchObject({
        fao: 'no'
      })
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitFAOService(session.id, payload)

      expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          fao: 'no'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          fao: 'no'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user has returned from the check page and made the same choice', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          fao: 'no'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          checkPageVisited: true,
          fao: 'no'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user had previously completed the "yes" journey', () => {
      beforeEach(() => {
        sessionData = {
          addressJourney: _addressJourney(session),
          billingAccount,
          contactName: 'Customer Name',
          contactSelected: 'new',
          fao: 'yes'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: null,
          checkPageVisited: false,
          contactName: null,
          contactSelected: null,
          fao: 'no'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })
  })

  describe('when the user has selected "new" for the existing address', () => {
    describe('and submits "no" for the fao', () => {
      beforeEach(() => {
        payload = {
          fao: 'no'
        }

        sessionData = {
          addressSelected: 'new',
          billingAccount
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService(session.id, payload)

        expect(session).toMatchObject({
          addressJourney: _addressJourney(session),
          fao: 'no'
        })
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService(session.id, payload)

        expect(result.redirectUrl).toEqual(`/system/address/${session.id}/postcode`)
      })
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFAOService(session.id, {})

      expect(result.error).toEqual({
        errorList: [
          {
            href: '#fao',
            text: 'Select yes if you need to add an FAO'
          }
        ],
        fao: { text: 'Select yes if you need to add an FAO' }
      })
    })
  })
})

function _addressJourney(session) {
  return {
    address: {},
    backLink: { href: `/system/billing-accounts/setup/${session.id}/fao`, text: 'Back' },
    pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
    redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
  }
}
