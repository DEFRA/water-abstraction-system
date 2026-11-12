// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from 'water-abstraction-engine/test/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModel from 'water-abstraction-engine/models/session.model.js'

// Things we need to stub
import * as DetermineLicenceMonitoringStationsService from '../../../../src/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js'

// Thing under test
import InitiateSessionService from '../../../../src/services/notices/setup/initiate-session.service.js'

describe('Notices - Setup - Initiate Session service', () => {
  let journey
  let monitoringStationId

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the journey is "standard"', () => {
      beforeEach(() => {
        journey = 'standard'
        monitoringStationId = undefined
      })

      it('returns the session Id and redirect path', async () => {
        const result = await InitiateSessionService(journey, monitoringStationId)

        expect(result).toEqual({
          path: 'notice-type',
          sessionId: result.sessionId
        })
      })

      it('initiates the session for the standard journey ', async () => {
        const result = await InitiateSessionService(journey, monitoringStationId)

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).toEqual({
          journey: 'standard'
        })
      })
    })

    describe('and the journey is "adhoc"', () => {
      beforeEach(() => {
        journey = 'adhoc'
        monitoringStationId = undefined
      })

      it('initiates the session for the ad-hoc notice setup journey and returns the session ID and redirect path', async () => {
        const result = await InitiateSessionService(journey, monitoringStationId)

        expect(result).toEqual({
          path: 'notice-type',
          sessionId: result.sessionId
        })

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.data).toEqual({
          journey: 'adhoc'
        })
      })
    })

    describe('and the journey is "alerts"', () => {
      let monitoringStationData

      beforeEach(() => {
        monitoringStationData = AbstractionAlertSessionData.get()

        journey = 'alerts'
        monitoringStationId = monitoringStationData.monitoringStationId

        vi.spyOn(DetermineLicenceMonitoringStationsService, 'default').mockResolvedValue(monitoringStationData)
      })

      it('initiates the session for the abstraction alerts setup journey and returns the session ID and redirect path', async () => {
        const result = await InitiateSessionService(journey, monitoringStationId)

        expect(result).toEqual({
          path: 'abstraction-alerts/alert-type',
          sessionId: result.sessionId
        })

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.referenceCode).toMatch(/^WAA-/)

        expect(matchingSession.data).toMatchObject({
          journey: 'alerts',
          licenceMonitoringStations: [
            {
              abstractionPeriodEndDay: 1,
              abstractionPeriodEndMonth: 1,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 2,
              id: monitoringStationData.licenceMonitoringStations[0].id,
              latestNotification: null,
              licence: {
                id: monitoringStationData.licenceMonitoringStations[0].licence.id,
                licenceRef: monitoringStationData.licenceMonitoringStations[0].licence.licenceRef
              },
              measureType: 'level',
              notes: null,
              restrictionType: 'reduce',
              thresholdGroup: 'level-1000-m',
              thresholdUnit: 'm',
              thresholdValue: 1000
            },
            {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              id: monitoringStationData.licenceMonitoringStations[1].id,
              latestNotification: null,
              licence: {
                id: monitoringStationData.licenceMonitoringStations[1].licence.id,
                licenceRef: monitoringStationData.licenceMonitoringStations[1].licence.licenceRef
              },
              measureType: 'flow',
              notes: 'I have a bad feeling about this',
              restrictionType: 'stop',
              thresholdGroup: 'flow-100-m3/s',
              thresholdUnit: 'm3/s',
              thresholdValue: 100
            },
            {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              id: monitoringStationData.licenceMonitoringStations[2].id,
              latestNotification: null,
              licence: {
                id: monitoringStationData.licenceMonitoringStations[2].licence.id,
                licenceRef: monitoringStationData.licenceMonitoringStations[2].licence.licenceRef
              },
              measureType: 'level',
              notes: null,
              restrictionType: 'stop_or_reduce',
              thresholdGroup: 'level-100-m',
              thresholdUnit: 'm',
              thresholdValue: 100
            }
          ],
          monitoringStationId,
          monitoringStationName: 'Death star',
          monitoringStationRiverName: 'Meridian Trench',
          name: 'Water abstraction alert',
          noticeType: 'abstractionAlerts',
          notificationType: 'Abstraction alert',
          subType: 'waterAbstractionAlerts'
        })
      })
    })
  })
})
