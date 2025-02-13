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
    it('correctly returns the redirect path and session id', async () => {
      const result = await InitiateSessionService.go('invitations')

      expect(result).to.equal({
        sessionId: result.sessionId,
        path: 'returns-period'
      })
    })

    describe('when the "notificationType" is "invitations"', () => {
      it('creates a new session record', async () => {
        const result = await InitiateSessionService.go('invitations')

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({
          journey: 'invitations',
          notificationType: 'Returns invitation',
          referenceCode: matchingSession.referenceCode // randomly generated
        })
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go('invitations')

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'returns-period'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for "invitations" notifications', async () => {
          const result = await InitiateSessionService.go('invitations')

          const matchingSession = await SessionModel.query().findById(result.sessionId)

          expect(matchingSession.referenceCode).to.include('RINV-')
          expect(matchingSession.referenceCode.length).to.equal(11)
        })
      })
    })

    describe('when the "notificationType" is "reminders"', () => {
      it('creates a new session record', async () => {
        const result = await InitiateSessionService.go('reminders')

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({
          journey: 'reminders',
          notificationType: 'Returns reminder',
          referenceCode: matchingSession.referenceCode // randomly generated
        })
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go('reminders')

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'returns-period'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for "reminders" notifications', async () => {
          const result = await InitiateSessionService.go('reminders')

          const matchingSession = await SessionModel.query().findById(result.sessionId)

          expect(matchingSession.referenceCode).to.include('RREM-')
          expect(matchingSession.referenceCode.length).to.equal(11)
        })
      })
    })

    describe('when the "notificationType" is "ad-hoc"', () => {
      it('creates a new session record', async () => {
        const result = await InitiateSessionService.go('ad-hoc')

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({
          journey: 'ad-hoc',
          notificationType: 'Ad hoc',
          referenceCode: matchingSession.referenceCode // randomly generated
        })
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go('ad-hoc')

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'licence'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for an "ad-hoc" notification', async () => {
          const result = await InitiateSessionService.go('ad-hoc')

          const matchingSession = await SessionModel.query().findById(result.sessionId)

          expect(matchingSession.referenceCode).to.include('ADHC-')
          expect(matchingSession.referenceCode.length).to.equal(11)
        })
      })
    })
  })
})
