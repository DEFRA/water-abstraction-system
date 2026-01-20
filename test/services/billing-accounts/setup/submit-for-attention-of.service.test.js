'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountsFixture = require('../../../fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitForAttentionOfService = require('../../../../app/services/billing-accounts/setup/submit-for-attention-of.service.js')

describe('Billing Accounts - Setup - Submit For Attention Of Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called with a "yes" value', () => {
    beforeEach(async () => {
      payload = {
        forAttentionOf: 'yes'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitForAttentionOfService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          forAttentionOf: 'yes'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitForAttentionOfService.go(session.id, payload)

      expect(result).to.equal({
        forAttentionOf: 'yes'
      })
    })
  })

  describe('when called with a "no" value', () => {
    beforeEach(async () => {
      payload = {
        forAttentionOf: 'no'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitForAttentionOfService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal(
        {
          forAttentionOf: 'no'
        },
        { skip: ['billingAccount'] }
      )
    })

    it('continues the journey', async () => {
      const result = await SubmitForAttentionOfService.go(session.id, payload)

      expect(result).to.equal({
        forAttentionOf: 'no'
      })
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitForAttentionOfService.go(session.id, {})

      expect(result.error).to.equal({
        errorList: [
          {
            href: '#forAttentionOf',
            text: 'Select if you need to add an FAO'
          }
        ],
        forAttentionOf: { text: 'Select if you need to add an FAO' }
      })
    })
  })
})
