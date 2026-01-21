'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitExistingAccountService = require('../../../../app/services/billing-accounts/setup/submit-existing-account.service.js')

describe('Billing Accounts - Setup - Submit Existing Account service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when the user picks an existing address', () => {
    beforeEach(async () => {
      payload = {
        existingAccount: generateUUID()
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          existingAccount: payload.existingAccount
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result).to.equal({
        existingAccount: payload.existingAccount
      })
    })
  })

  describe('when the user picks use an existing account', () => {
    beforeEach(async () => {
      payload = {
        existingAccount: 'new'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitExistingAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          existingAccount: 'new'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result).to.equal({
        existingAccount: 'new'
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitExistingAccountService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#existingAccount',
            text: `Select does this account already exist?`
          }
        ],
        existingAccount: { text: `Select does this account already exist?` }
      })
    })
  })
})
