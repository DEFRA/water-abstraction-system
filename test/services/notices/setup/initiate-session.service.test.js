'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Things we need to stub
const DetermineLicenceMonitoringStationsService = require('../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/notices/setup/initiate-session.service.js')

describe('Notices - Setup - Initiate Session service', () => {
  afterEach(() => {
    Sinon.restore()
  })

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
          name: 'Returns: invitation',
          notificationType: 'Returns invitation',
          referenceCode: matchingSession.referenceCode, // randomly generated
          subType: 'returnInvitation'
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
          name: 'Returns: reminder',
          notificationType: 'Returns reminder',
          referenceCode: matchingSession.referenceCode, // randomly generated
          subType: 'returnReminder'
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
          name: 'Returns: ad-hoc',
          notificationType: 'Ad hoc',
          referenceCode: matchingSession.referenceCode, // randomly generated
          subType: 'adHocReminder'
        })
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go('ad-hoc')

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'ad-hoc-licence'
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

    describe('when the "notificationType" is "abstraction-alert"', () => {
      const monitoringStationId = '1234'

      let monitoringStationData

      beforeEach(() => {
        monitoringStationData = AbstractionAlertSessionData.monitoringStation()

        Sinon.stub(DetermineLicenceMonitoringStationsService, 'go').resolves(monitoringStationData)
      })

      it('creates a new session record', async () => {
        const result = await InitiateSessionService.go('abstraction-alert', monitoringStationId)

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({
          journey: 'abstraction-alert',
          name: 'Water abstraction alert',
          notificationType: 'Abstraction alert',
          referenceCode: matchingSession.referenceCode, // randomly generated
          subType: 'waterAbstractionAlerts',
          ...monitoringStationData
        })
      })

      it('adds the additional monitoring session data', async () => {
        const result = await InitiateSessionService.go('abstraction-alert', monitoringStationId)

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data.monitoringStationName).to.equal('Death star')
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go('abstraction-alert', monitoringStationId)

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'abstraction-alert/alert-type'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for an "ad-hoc" notification', async () => {
          const result = await InitiateSessionService.go('abstraction-alert', monitoringStationId)

          const matchingSession = await SessionModel.query().findById(result.sessionId)

          expect(matchingSession.referenceCode).to.include('WAA-')
          expect(matchingSession.referenceCode.length).to.equal(10)
        })
      })
    })
  })
})
