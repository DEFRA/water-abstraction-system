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
  const companyContacts = CustomersFixture.companyContacts()

  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called with valid data', () => {
    describe('such as "new"', () => {
      it('saves the submitted value', async () => {
        payload = {
          contactSelected: 'new'
        }

        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
      })

      it('continues the journey', async () => {
        payload = {
          contactSelected: 'new'
        }

        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/contact-name`
        })
      })
    })

    describe('such as a UUID of a contact id', () => {
      it('saves the submitted value', async () => {
        payload = {
          contactSelected: companyContacts[0].contact.id
        }

        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
      })

      it('continues the journey', async () => {
        payload = {
          contactSelected: companyContacts[0].contact.id
        }

        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
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
