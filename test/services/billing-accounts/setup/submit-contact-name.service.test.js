'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitContactNameService = require('../../../../app/services/billing-accounts/setup/submit-contact-name.service.js')

describe('Billing Accounts - Setup - Contact Name Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount

  let fetchSessionStub
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      billingAccount
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      payload = {
        contactName: 'Contact Name'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitContactNameService.go(session.id, payload)

      expect(session.contactName).to.equal(payload.contactName)
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitContactNameService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
      })
    })

    describe('and the user has returned to the page and entered the same name', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          contactName: 'Contact Name'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService.go(session.id, payload)

        expect(session.contactName).to.equal(payload.contactName)
        expect(session.$update.called).to.be.true()
      })

      it('continues the journey', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user has returned to the page from the check and entered the same name', () => {
      beforeEach(() => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService.go(session.id, payload)

        expect(session.contactName).to.equal(payload.contactName)
        expect(session.checkPageVisited).to.equal(true)
        expect(session.$update.called).to.be.true()
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactNameService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user has returned to the page from the check and changes the contact name', () => {
      beforeEach(() => {
        payload = {
          contactName: 'New Name'
        }

        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactName: 'Contact Name'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactNameService.go(session.id, payload)

        expect(session.contactName).to.equal(payload.contactName)
        expect(session.checkPageVisited).to.equal(false)

        expect(session.$update.called).to.be.true()
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
