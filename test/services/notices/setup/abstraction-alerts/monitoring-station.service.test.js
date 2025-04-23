'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const MonitoringStationHelper = require('../../../../support/helpers/monitoring-station.helper.js')

// Thing under test
const MonitoringStationService = require('../../../../../app/services/notices/setup/abstraction-alerts/monitoring-station.service.js')

describe('Notices Setup - Abstraction alerts - Monitoring station service', () => {
  let monitoringStation

  beforeEach(async () => {
    monitoringStation = await MonitoringStationHelper.add()
  })

  it('correctly returns the data', async () => {
    const result = await MonitoringStationService.go(monitoringStation.id)

    expect(result).to.equal({
      label: 'MONITOR PLACE'
    })
  })
})
