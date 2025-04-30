'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const MonitoringStationHelper = require('../../../support/helpers/monitoring-station.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/licence-monitoring-station/setup/initiate-session.service.js')

describe('Licence Monitoring Station - Setup - Initiate Session service', () => {
  let monitoringStation

  before(async () => {
    monitoringStation = await MonitoringStationHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates a new session record containing details of the monitoring station', async () => {
      const sessionId = await InitiateSessionService.go(monitoringStation.id)

      const matchingSession = await SessionModel.query().findById(sessionId)

      expect(matchingSession.data).to.equal({
        monitoringStationId: monitoringStation.id,
        label: monitoringStation.label
      })
    })
  })
})
