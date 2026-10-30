// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModel from 'water-abstraction-engine/models/session.model.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchMonitoringStationDal from '../../../../src/dal/licence-monitoring-station/setup/fetch-monitoring-station.dal.js'

// Thing under test
import InitiateSessionService from '../../../../src/services/licence-monitoring-station/setup/initiate-session.service.js'

describe('Licence Monitoring Station - Setup - Initiate Session service', () => {
  let fetchMonitoringStationDalStub
  let monitoringStation
  let monitoringStationId

  beforeEach(() => {
    monitoringStationId = generateUUID()
    monitoringStation = { label: 'Wellingborough' }

    fetchMonitoringStationDalStub = vi.spyOn(FetchMonitoringStationDal, 'default').mockResolvedValue(monitoringStation)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('calls the "FetchMonitoringStationDal" to fetch the monitoring station', async () => {
      await InitiateSessionService(monitoringStationId)

      expect(fetchMonitoringStationDalStub).toHaveBeenCalledExactlyOnceWith(monitoringStationId)
    })

    it('creates a new session record containing details of the monitoring station', async () => {
      const sessionId = await InitiateSessionService(monitoringStationId)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).toEqual({
        label: monitoringStation.label,
        monitoringStationId
      })
    })
  })
})
