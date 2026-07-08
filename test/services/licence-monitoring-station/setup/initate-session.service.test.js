'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const MonitoringStationHelper = require('../../../support/helpers/monitoring-station.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/licence-monitoring-station/setup/initiate-session.service.js')

describe('Licence Monitoring Station - Setup - Initiate Session service', () => {
  let monitoringStation

  beforeAll(async () => {
    monitoringStation = await MonitoringStationHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
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
