'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/notifications/setup/initiate-session.service.js')

describe('Notifications Setup - Initiate Session service', () => {
  describe('when called', () => {
    it('creates a new session record', async () => {
      const result = await InitiateSessionService.go()

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).to.equal({
        notificationType: 'Returns invitation',
        referenceCode: matchingSession.referenceCode // randomly generated
      })
    })

    describe('the "referenceCode" property', () => {
      it('returns a reference code for an "invitation" notification', async () => {
        const result = await InitiateSessionService.go()

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.referenceCode).to.include('RINV-')
        expect(matchingSession.referenceCode.length).to.equal(11)
      })
    })
  })
})
