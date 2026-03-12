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

  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
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
        { skip: ['billingAccount'] }
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
          { skip: ['billingAccount'] }
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
        { skip: ['billingAccount'] }
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
          { skip: ['billingAccount'] }
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
            checkPageVisited: false,
            contactName: null,
            contactSelected: null,
            fao: 'no'
          },
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
      })
    })

    describe('and the user had previously been to the check page', () => {
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
          { skip: ['billingAccount'] }
        )
      })

      it('continues the journey', async () => {
        const result = await SubmitFAOService.go(session.id, payload)

        expect(result.redirectUrl).to.equal(`/system/billing-accounts/setup/${session.id}/check`)
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
