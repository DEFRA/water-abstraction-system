'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSelectAccountService = require('../../../../app/services/billing-accounts/setup/submit-select-account.service.js')

describe('Billing Accounts - Setup - Select Account Service', () => {
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

  describe('when the user picks the customer option', () => {
    beforeEach(async () => {
      payload = {
        accountSelected: 'customer'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitSelectAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          accountSelected: 'customer'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('returns the correct details the controller needs to redirect the journey', async () => {
      const result = await SubmitSelectAccountService.go(session.id, payload)

      expect(result).to.equal({
        accountSelected: 'customer'
      })
    })
  })

  describe('when the user picks the another option', () => {
    beforeEach(async () => {
      payload = {
        accountSelected: 'another'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitSelectAccountService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
          accountSelected: 'another'
        },
        { skip: ['billingAccount'] })
    })

    it('returns the correct details the controller needs to redirect the journey', async () => {
      const result = await SubmitSelectAccountService.go(session.id, payload)

      expect(result).to.equal({
        accountSelected: 'another'
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {
        accountSelected: 'wrong'
      }
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectAccountService.go(session.id, payload)

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#accountSelected',
            text: 'Select who should the bills go to'
          }
        ],
        accountSelected: { text: 'Select who should the bills go to' }
      })
    })
  })
})
