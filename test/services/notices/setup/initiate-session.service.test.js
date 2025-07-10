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
  let journey
  let monitoringStationId
  let noticeType

  beforeEach(() => {
    journey = 'standard'
    noticeType = 'invitations'
    monitoringStationId = undefined
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates a new session record', async () => {
      const result = await InitiateSessionService.go(journey, noticeType)

      const matchingSession = await SessionModel.query().findById(result.sessionId)

      expect(matchingSession.data).to.equal({
        journey: 'standard',
        name: 'Returns: invitation',
        noticeType: 'invitations',
        notificationType: 'Returns invitation',
        referenceCode: matchingSession.referenceCode, // randomly generated
        subType: 'returnInvitation'
      })
    })

    it('correctly returns the redirect path and session id', async () => {
      const result = await InitiateSessionService.go(journey, noticeType)

      expect(result).to.equal({
        sessionId: result.sessionId,
        path: 'returns-period'
      })
    })

    describe('when the "journey" is "adHoc"', () => {
      beforeEach(() => {
        journey = 'adHoc'
        noticeType = undefined
      })

      it('creates a new session record', async () => {
        const result = await InitiateSessionService.go(journey, noticeType)

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({ journey: 'adHoc' })
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go(journey, noticeType)

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'licence'
        })
      })
    })

    describe('when the "notificationType" is "abstraction-alert"', () => {
      let monitoringStationData

      beforeEach(() => {
        journey = 'abstraction-alert'
        noticeType = 'abstraction-alert'
        monitoringStationId = '1234'

        monitoringStationData = AbstractionAlertSessionData.get()

        Sinon.stub(DetermineLicenceMonitoringStationsService, 'go').resolves(monitoringStationData)
      })

      it('creates a new session record', async () => {
        const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({
          journey: 'abstraction-alert',
          name: 'Water abstraction alert',
          noticeType: 'abstraction-alert',
          notificationType: 'Abstraction alert',
          referenceCode: matchingSession.referenceCode, // randomly generated
          subType: 'waterAbstractionAlerts',
          ...monitoringStationData
        })
      })

      it('adds the additional monitoring session data', async () => {
        const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data.monitoringStationName).to.equal('Death star')
      })

      it('correctly returns the redirect path and session id', async () => {
        const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'abstraction-alerts/alert-type'
        })
      })
    })
  })
})
