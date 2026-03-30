'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitFAOService = require('../../../../app/services/billing-accounts/setup/submit-fao.service.js')

describe('Billing Accounts - Setup - Submit FAO Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const billingAccountAddress = billingAccount.billingAccountAddresses[0].address

  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      addressSelected: billingAccountAddress.id,
      billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called with a "yes" value', () => {
    beforeEach(async () => {
      payload = {
        fao: 'yes'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitFAOService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          fao: 'yes'
        },
        { skip: ['addressSelected', 'billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitFAOService.go(session.id, payload)

      expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/contact`)
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          fao: 'yes'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            fao: 'yes'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/contact`)
      })
    })

    describe('and the user has returned from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          fao: 'yes'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            checkPageVisited: true,
            fao: 'yes'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user had previously completed the "no" journey', () => {
      beforeEach(async () => {
        sessionData = {
          addressJourney: _addressJourney(session),
          billingAccount,
          fao: 'no'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressJourney: null,
            checkPageVisited: false,
            contactName: null,
            contactSelected: null,
            fao: 'yes'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/contact`)
      })
    })
  })

  describe('when called with a "no" value', () => {
    beforeEach(async () => {
      payload = {
        fao: 'no'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitFAOService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          fao: 'no'
        },
        { skip: ['addressSelected', 'billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitFAOService.go(session.id, payload)

      expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          fao: 'no'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            fao: 'no'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user has returned from the check page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          fao: 'no'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            checkPageVisited: true,
            fao: 'no'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user had previously completed the "yes" journey', () => {
      beforeEach(async () => {
        sessionData = {
          addressJourney: _addressJourney(session),
          billingAccount,
          contactName: 'Customer Name',
          contactSelected: 'new',
          fao: 'yes'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressJourney: null,
            checkPageVisited: false,
            contactName: null,
            contactSelected: null,
            fao: 'no'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })
  })

  describe('when the user has selected "new" for the existing address', () => {
    describe('and submits "no" for the fao', () => {
      beforeEach(async () => {
        payload = {
          fao: 'no'
        }

        sessionData = {
          addressSelected: 'new',
          billingAccount
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitFAOService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data).to.equal(
          {
            addressJourney: _addressJourney(refreshedSession),
            fao: 'no'
          },
          { skip: ['addressSelected', 'billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/address/${session.id}/postcode`)
      })
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFAOService.go(session.id, {})

      expect(result.error).to.equal({
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
