'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers

// Thing under test
const InitiateSessionService = require('../../../../app/services/billing-accounts/setup/initiate-session.service.js')

describe('Billing Accounts - Setup - Initiate Session service', () => {
  let billingAccountId

  describe('when called', () => {
    before(async () => {
      billingAccountId = generateUUID()
    })

    it('creates a new session record containing details of the billing account', async () => {
      const result = await InitiateSessionService.go(billingAccountId)

      expect(result.data).to.equal(
        {
          billingAccountId
        },
        { skip: ['id'] }
      )
    })
  })
})
