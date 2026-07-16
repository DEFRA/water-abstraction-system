// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as AbstractionAlertSessionData from '../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModel from '../../../../app/models/session.model.js'

// Things we need to stub
import DetermineLicenceMonitoringStationsService from '../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js'

// Thing under test
import InitiateSessionService from '../../../../app/services/notices/setup/initiate-session.service.js'

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
          sessionId: result.sessionId,
          path: 'notice-type'
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
          sessionId: result.sessionId,
          path: 'notice-type'
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

        vi.mock(
          '../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js'
        )
        DetermineLicenceMonitoringStationsService.mockResolvedValue(monitoringStationData)
      })

      it('initiates the session for the abstraction alerts setup journey and returns the session ID and redirect path', async () => {
        const result = await InitiateSessionService(journey, monitoringStationId)

        expect(result).toEqual({
          sessionId: result.sessionId,
          path: 'abstraction-alerts/alert-type'
        })

        const matchingSession = await SessionModel.query().findById(result.sessionId)

        expect(matchingSession.referenceCode).toMatch(/^WAA-/)

        expect(matchingSession.data).toMatchObject({
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
              licence: {
                id: monitoringStationData.licenceMonitoringStations[0].licence.id,
                licenceRef: monitoringStationData.licenceMonitoringStations[0].licence.licenceRef
              },
              measureType: 'level',
              thresholdUnit: 'm',
              thresholdGroup: 'level-1000-m',
              thresholdValue: 1000,
              restrictionType: 'reduce',
              latestNotification: null,
              abstractionPeriodEndDay: 1,
              abstractionPeriodEndMonth: 1,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 2
            },
            {
              id: monitoringStationData.licenceMonitoringStations[1].id,
              notes: 'I have a bad feeling about this',
              licence: {
                id: monitoringStationData.licenceMonitoringStations[1].licence.id,
                licenceRef: monitoringStationData.licenceMonitoringStations[1].licence.licenceRef
              },
              measureType: 'flow',
              thresholdUnit: 'm3/s',
              thresholdGroup: 'flow-100-m3/s',
              thresholdValue: 100,
              restrictionType: 'stop',
              latestNotification: null,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1
            },
            {
              id: monitoringStationData.licenceMonitoringStations[2].id,
              notes: null,
              licence: {
                id: monitoringStationData.licenceMonitoringStations[2].licence.id,
                licenceRef: monitoringStationData.licenceMonitoringStations[2].licence.licenceRef
              },
              measureType: 'level',
              thresholdUnit: 'm',
              thresholdGroup: 'level-100-m',
              thresholdValue: 100,
              restrictionType: 'stop_or_reduce',
              latestNotification: null,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1
            }
          ],
          monitoringStationRiverName: 'Meridian Trench'
        })
      })
    })
  })
})
