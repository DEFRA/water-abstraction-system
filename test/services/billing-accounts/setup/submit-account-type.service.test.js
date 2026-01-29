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
const SubmitAccountTypeService = require('../../../../app/services/billing-accounts/setup/submit-account-type.service.js')

describe('Billing Accounts - Setup - Account Type Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { accountType: 'company' }
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called with "company" selected', () => {
    it('saves the submitted value', async () => {
      await SubmitAccountTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.accountType).to.equal('company')
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountTypeService.go(session.id, payload)

      expect(result).to.equal({
        accountType: 'company'
      })
    })
  })

  describe('when called with "individual" selected and a search term entered', () => {
    beforeEach(async () => {
      payload = { accountType: 'individual', searchIndividualInput: 'John Doe' }
      sessionData = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitAccountTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.accountType).to.equal('individual')
      expect(refreshedSession.searchIndividualInput).to.equal('John Doe')
    })

    it('continues the journey', async () => {
      const result = await SubmitAccountTypeService.go(session.id, payload)

      expect(result).to.equal({
        accountType: 'individual'
      })
    })
  })

  describe('when validation fails', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#accountType',
              text: 'Select the account type'
            }
          ],
          accountType: { text: 'Select the account type' }
        })
      })
    })

    describe('because the user selected "individual" but did not enter a search input', () => {
      beforeEach(() => {
        payload = {
          accountType: 'individual'
        }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAccountTypeService.go(session.id, payload)

        expect(result.error).to.equal({
          errorList: [
            {
              href: '#searchIndividualInput',
              text: 'Enter the full name of the individual.'
            }
          ],
          searchIndividualInput: { text: 'Enter the full name of the individual.' }
        })
      })
    })
  })
})
