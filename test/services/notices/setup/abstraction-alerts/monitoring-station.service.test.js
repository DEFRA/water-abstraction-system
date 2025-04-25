'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../../support/helpers/licence.helper.js')
const LicenceMonitoringStationModel = require('../../../../support/helpers/licence-monitoring-station.helper.js')
const MonitoringStationHelper = require('../../../../support/helpers/monitoring-station.helper.js')

// Thing under test
const MonitoringStationService = require('../../../../../app/services/notices/setup/abstraction-alerts/monitoring-station.service.js')

describe('Notices Setup - Abstraction alerts - Monitoring station service', () => {
  let licence
  let monitoringStation

  beforeEach(async () => {
    monitoringStation = await MonitoringStationHelper.add()

    licence = await LicenceHelper.add()

    await LicenceMonitoringStationModel.add({
      licenceId: licence.id,
      monitoringStationId: monitoringStation.id,
      abstraction_period_end_day: '01',
      abstraction_period_end_month: '01',
      abstraction_period_start_day: '01',
      abstraction_period_start_month: '02'
    })
  })

  it('correctly returns the data', async () => {
    const result = await MonitoringStationService.go(monitoringStation.id)

    expect(result).to.equal({
      licenceMonitoringStations: [
        {
          abstraction_period_end_day: 1,
          abstraction_period_end_month: 1,
          abstraction_period_start_day: 1,
          abstraction_period_start_month: 2,
          licence_id: licence.id,
          licence_ref: licence.licenceRef,
          licence_version_purpose_condition_id: null,
          measure_type: 'flow',
          restriction_type: 'reduce',
          start_date: new Date('2022-01-01'),
          status: 'resume',
          status_updated_at: null,
          threshold_unit: 'm3/s',
          threshold_value: 100
        }
      ],
      monitoringStationName: 'MONITOR PLACE'
    })
  })

  describe('the "monitoringStationName" property', () => {
    it('should return the monitoring station name', async () => {
      const result = await MonitoringStationService.go(monitoringStation.id)

      expect(result.monitoringStationName).to.equal('MONITOR PLACE')
    })
  })
})
