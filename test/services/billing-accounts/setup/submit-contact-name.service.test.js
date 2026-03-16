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
const SubmitContactNameService = require('../../../../app/services/billing-accounts/setup/submit-contact-name.service.js')

describe('Billing Accounts - Setup - Contact Name Service', () => {
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

  describe('when called', () => {
    beforeEach(async () => {
      payload = {
        contactName: 'Contact Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitContactNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactName).to.equal(payload.contactName)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactNameService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
      })
    })

    describe('and the user has returned to the page and entered the same name', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          contactName: 'Contact Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactName).to.equal(payload.contactName)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user has returned to the page from the check and entered the same name', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactName).to.equal(payload.contactName)
        expect(refreshedSession.checkPageVisited).to.equal(true)
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user has returned to the page from the check and changes the contact name', () => {
      beforeEach(async () => {
        payload = {
          contactName: 'New Name'
        }

        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactName).to.equal(payload.contactName)
        expect(refreshedSession.checkPageVisited).to.equal(false)
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because nothing was entered', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#contactName',
              text: 'Enter a name for the contact'
            }
          ],
          contactName: {
            text: 'Enter a name for the contact'
          }
        })
      })
    })

    describe('because too many characters were entered', () => {
      beforeEach(() => {
        payload = {
          contactName: 'a'.repeat(101)
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#contactName',
              text: 'Name must be 100 characters or less'
            }
          ],
          contactName: {
            text: 'Name must be 100 characters or less'
          }
        })
      })
    })
  })
})
