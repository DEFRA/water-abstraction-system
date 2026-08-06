// Test framework
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

// Test helpers
import MonitoringStationHelper from 'water-abstraction-engine/test/helpers/monitoring-station.helper.js'
import SessionModel from 'water-abstraction-engine/models/session.model.js'

// Thing under test
import InitiateSessionService from '../../../../src/services/licence-monitoring-station/setup/initiate-session.service.js'

describe('Licence Monitoring Station - Setup - Initiate Session service', () => {
  let monitoringStation

  beforeAll(async () => {
    monitoringStation = await MonitoringStationHelper.add()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('creates a new session record containing details of the monitoring station', async () => {
      const sessionId = await InitiateSessionService(monitoringStation.id)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).toEqual({
        monitoringStationId: monitoringStation.id,
        label: monitoringStation.label
      })
    })
  })
})
