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
  let noticeType
  let monitoringStationId

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the journey is "standard"', () => {
      describe('and the notice type is "invitations"', () => {
        beforeEach(() => {
          journey = 'standard'
          noticeType = 'invitations'
          monitoringStationId = undefined
        })

        it('initiates the session for the return invitations notice setup journey and returns the session ID and redirect path', async () => {
          const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

          expect(result).to.equal({
            sessionId: result.sessionId,
            path: 'returns-period'
          })

          const matchingSession = await SessionModel.query().findById(result.sessionId)

          expect(matchingSession.referenceCode).to.startWith('RINV-')

          expect(matchingSession.data).to.equal(
            {
              name: 'Returns: invitation',
              journey: 'standard',
              subType: 'returnInvitation',
              noticeType: 'invitations',
              notificationType: 'Returns invitation'
            },
            { skip: ['referenceCode'] }
          )
        })
      })

      describe('and the notice type is "reminders"', () => {
        beforeEach(() => {
          journey = 'standard'
          noticeType = 'reminders'
          monitoringStationId = undefined
        })

        it('initiates the session for the return reminders notice setup journey and returns the session ID and redirect path', async () => {
          const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

          expect(result).to.equal({
            sessionId: result.sessionId,
            path: 'returns-period'
          })

          const matchingSession = await SessionModel.query().findById(result.sessionId)

          expect(matchingSession.referenceCode).to.startWith('RREM-')

          expect(matchingSession.data).to.equal(
            {
              name: 'Returns: reminder',
              journey: 'standard',
              subType: 'returnReminder',
              noticeType: 'reminders',
              notificationType: 'Returns reminder'
            },
            { skip: ['referenceCode'] }
          )
        })
      })
    })

    describe('and the journey is "adhoc"', () => {
      beforeEach(() => {
        journey = 'adhoc'
        noticeType = undefined
        monitoringStationId = undefined
      })

      it('initiates the session for the ad-hoc notice setup journey and returns the session ID and redirect path', async () => {
        const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'licence'
        })

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).to.equal({
          journey: 'adhoc'
        })
      })
    })

    describe('and the journey is "alerts"', () => {
      let monitoringStationData

      beforeEach(() => {
        monitoringStationData = AbstractionAlertSessionData.get()

        journey = 'alerts'
        noticeType = undefined
        monitoringStationId = monitoringStationData.monitoringStationId

        Sinon.stub(DetermineLicenceMonitoringStationsService, 'go').resolves(monitoringStationData)
      })

      it('initiates the session for the abstraction alerts setup journey and returns the session ID and redirect path', async () => {
        const result = await InitiateSessionService.go(journey, noticeType, monitoringStationId)

        expect(result).to.equal({
          sessionId: result.sessionId,
          path: 'abstraction-alerts/alert-type'
        })

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.referenceCode).to.startWith('WAA-')

        expect(matchingSession.data).to.equal(
          {
            name: 'Water abstraction alert',
            journey: 'alerts',
            subType: 'waterAbstractionAlerts',
            noticeType: 'abstractionAlerts',
            notificationType: 'Abstraction alert',
            monitoringStationId,
            monitoringStationName: 'Death star',
            licenceMonitoringStations: [
              {
                id: monitoringStationData.licenceMonitoringStations[0].id,
                notes: null,
                status: null,
                licence: {
                  id: monitoringStationData.licenceMonitoringStations[0].licence.id,
                  licenceRef: monitoringStationData.licenceMonitoringStations[0].licence.licenceRef
                },
                measureType: 'level',
                thresholdUnit: 'm',
                thresholdGroup: 'level-1000-m',
                thresholdValue: 1000,
                restrictionType: 'reduce',
                statusUpdatedAt: null,
                abstractionPeriodEndDay: 1,
                abstractionPeriodEndMonth: 1,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 2
              },
              {
                id: monitoringStationData.licenceMonitoringStations[1].id,
                notes: 'I have a bad feeling about this',
                status: null,
                licence: {
                  id: monitoringStationData.licenceMonitoringStations[1].licence.id,
                  licenceRef: monitoringStationData.licenceMonitoringStations[1].licence.licenceRef
                },
                measureType: 'flow',
                thresholdUnit: 'm3/s',
                thresholdGroup: 'flow-100-m3/s',
                thresholdValue: 100,
                restrictionType: 'stop',
                statusUpdatedAt: null,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1
              },
              {
                id: monitoringStationData.licenceMonitoringStations[2].id,
                notes: null,
                status: null,
                licence: {
                  id: monitoringStationData.licenceMonitoringStations[2].licence.id,
                  licenceRef: monitoringStationData.licenceMonitoringStations[2].licence.licenceRef
                },
                measureType: 'level',
                thresholdUnit: 'm',
                thresholdGroup: 'level-100-m',
                thresholdValue: 100,
                restrictionType: 'stop',
                statusUpdatedAt: null,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1
              }
            ],
            monitoringStationRiverName: 'Meridian Trench'
          },
          { skip: ['referenceCode'] }
        )
      })
    })
  })
})
