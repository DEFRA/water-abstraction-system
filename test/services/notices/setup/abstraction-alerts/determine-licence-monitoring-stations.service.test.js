'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchLicenceMonitoringStationsService = require('../../../../../app/services/notices/setup/abstraction-alerts/fetch-licence-monitoring-stations.service.js')

// Thing under test
const DetermineLicenceMonitoringStationsService = require('../../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js')

describe('Notices Setup - Abstraction Alerts - Determine Licence Monitoring Stations service', () => {
  const monitoringStation = generateUUID()

  beforeEach(async () => {
    Sinon.stub(FetchLicenceMonitoringStationsService, 'go').resolves([
      {
        abstraction_period_end_day: 1,
        abstraction_period_end_month: 1,
        abstraction_period_start_day: 1,
        abstraction_period_start_month: 2,
        label: 'MONITOR PLACE',
        licence_id: '123',
        licence_ref: '123/456',
        licence_version_purpose_condition_id: null,
        measure_type: 'flow',
        restriction_type: 'reduce',
        start_date: new Date('2022-01-01'),
        status: 'resume',
        status_updated_at: null,
        threshold_unit: 'm3/s',
        threshold_value: 100
      }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly returns the data', async () => {
    const result = await DetermineLicenceMonitoringStationsService.go(monitoringStation.id)

    expect(result).to.equal({
      licenceMonitoringStations: [
        {
          abstraction_period_end_day: 1,
          abstraction_period_end_month: 1,
          abstraction_period_start_day: 1,
          abstraction_period_start_month: 2,
          licence_id: '123',
          licence_ref: '123/456',
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
      const result = await DetermineLicenceMonitoringStationsService.go(monitoringStation.id)

      expect(result.monitoringStationName).to.equal('MONITOR PLACE')
    })
  })
})
