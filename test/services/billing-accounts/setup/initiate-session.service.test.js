'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const SessionModel = require('../../../../app/models/session.model.js')

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

      const sessionId = _getSessionId(result)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(result).to.equal(`/system/billing-accounts/setup/${sessionId}/select-account`)
      expect(matchingSession.data).to.equal({
        billingAccountId
      })
    })
  })
})

// InitiateSessionService returns a string in the format`/system/return-logs/setup/${sessionId}/${redirect}`. We extract
// the session id by splitting by '/' and taking the next-to-last element
function _getSessionId(url) {
  return url.split('/').at(-2)
}
