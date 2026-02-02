'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitContactService = require('../../../../app/services/billing-accounts/setup/submit-contact.service.js')

describe('Billing Accounts - Setup - Contact Service', () => {
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
    describe('such as "person"', () => {
      it('saves the submitted value', async () => {
        payload = {
          contactSelected: 'person'
        }

        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
      })

      it('continues the journey', async () => {
        payload = {
          contactSelected: 'person'
        }

        const result = await SubmitContactService.go(session.id, payload)

        expect(result).to.equal({
          redirectUrl: `/system/billing-accounts/setup/${session.id}/create-contact`
        })
      })
    })

    describe('such as "department"', () => {
      it('saves the submitted value', async () => {
        payload = {
          contactSelected: 'department',
          departmentName: 'Department Name'
        }

        await SubmitContactService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactSelected).to.equal(payload.contactSelected)
        expect(refreshedSession.department).to.equal(payload.department)
      })

      it('continues the journey', async () => {
        payload = {
          contactSelected: 'department',
          departmentName: 'Department Name'
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

    describe('because the user selected "department" but did not enter a name', () => {
      beforeEach(() => {
        payload = {
          contactSelected: 'department'
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#departmentName',
              text: 'Department name cannot be blank'
            }
          ],
          departmentName: {
            text: 'Department name cannot be blank'
          }
        })
      })

      describe('because the user selected "department" but entered an invalid input', () => {
        beforeEach(async () => {
          payload = {
            contactSelected: 'department',
            departmentName: 'a'.repeat(101)
          }
        })

        it('returns page data for the view, with errors', async () => {
          const result = await SubmitContactService.go(session.id, payload)

          expect(result.error).to.equal({
            errorList: [
              {
                href: '#departmentName',
                text: 'Department name must be 100 characters or less'
              }
            ],
            departmentName: { text: 'Department name must be 100 characters or less' }
          })
        })
      })
    })
  })
})
