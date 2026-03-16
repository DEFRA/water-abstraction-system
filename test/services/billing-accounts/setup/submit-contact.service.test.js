'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchCompanyContactsService = require('../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixture.js')
const CustomersFixture = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitContactService = require('../../../../app/services/billing-accounts/setup/submit-contact.service.js')

describe('Billing Accounts - Setup - Contact Service', () => {
  const billingAccount = BillingAccountsFixture.billingAccount().billingAccount
  const exampleContacts = CustomersFixture.companyContacts()
  const contact = exampleContacts[0].contact
  const companyContacts = {
    company: billingAccount.company,
    contacts: [contact]
  }

  let payload
  let session
  let sessionData

  beforeEach(async () => {})

  afterEach(async () => {
    await session.$query().delete()
    Sinon.restore()
  })

  describe('when the user picks to set up a "new" contact', () => {
    beforeEach(async () => {
      payload = {
        contactSelected: 'new'
      }

      sessionData = {
        billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitContactService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/contact-name`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          contactSelected: 'new'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/contact-name`
        })
      })
    })

    describe('and the user has returned to the page from the check and made the same choice', () => {
      beforeEach(async () => {
        sessionData = {
          billingAccount,
          checkPageVisited: true,
          contactSelected: 'new'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
      })

      it('returns to the check page', async () => {
        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })
  })

  describe('when the user picks an existing contact', () => {
    beforeEach(async () => {
      payload = {
        contactSelected: contact.id
      }

      sessionData = {
        billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitContactService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
      })
    })

    describe('and the user has returned to the page and made the same choice', () => {
      beforeEach(async () => {
        payload = {
          contactSelected: contact.id
        }

        sessionData = {
          billingAccount,
          contactSelected: contact.id
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })

    describe('and the user had previously completed the "new" journey', () => {
      beforeEach(async () => {
        payload = {
          contactSelected: contact.id
        }

        sessionData = {
          billingAccount,
          contactSelected: 'new',
          contactName: 'Contact Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
        expect(refreshedSession.contactName).to.equal(null)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      describe('and the user had chosen the current customer', () => {
        beforeEach(async () => {
          payload = {}
          sessionData = {
            accountSelected: billingAccount.company.id,
            billingAccount,
            contactSelected: 'new',
            contactName: 'Contact Name'
          }

          session = await SessionHelper.add({ data: sessionData })

          Sinon.stub(FetchCompanyContactsService, 'go').resolves(companyContacts)
        })

        it('returns page data for the view, with errors', async () => {
          const result = await SubmitContactService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#contactSelected',
                text: 'Select a contact'
              }
            ],
            contactSelected: {
              text: 'Select a contact'
            }
          })
        })
      })

      describe('and the user had chosen another customer', () => {
        beforeEach(async () => {
          payload = {}
          sessionData = {
            accountSelected: 'another',
            billingAccount,
            contactSelected: 'new',
            contactName: 'Contact Name',
            existingAccount: billingAccount.company.id
          }

          session = await SessionHelper.add({ data: sessionData })

          Sinon.stub(FetchCompanyContactsService, 'go').resolves(companyContacts)
        })

        it('returns page data for the view, with errors', async () => {
          const result = await SubmitContactService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#contactSelected',
                text: 'Select a contact'
              }
            ],
            contactSelected: {
              text: 'Select a contact'
            }
          })
        })
      })
    })
  })
})
