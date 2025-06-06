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
const FetchMonitoringStationService = require('../../../../../app/services/notices/setup/abstraction-alerts/fetch-monitoring-station.service.js')

// Thing under test
const DetermineLicenceMonitoringStationsService = require('../../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js')

describe('Notices Setup - Abstraction Alerts - Determine Licence Monitoring Stations service', () => {
  const monitoringStation = generateUUID()

  beforeEach(async () => {
    Sinon.stub(FetchMonitoringStationService, 'go').resolves({
      id: monitoringStation.id,
      label: 'MONITOR PLACE',
      licenceMonitoringStations: [
        {
          abstractionPeriodEndDay: 1,
          abstractionPeriodEndMonth: 1,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 2,
          measureType: 'flow',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          id: 'c4f6d976-3b18-44bc-b2b4-a649421faf2e',
          licence: {
            id: '123',
            licenceRef: '01/01/01/6880'
          },
          licenceVersionPurposeCondition: null
        },
        {
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null,
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null,
          measureType: 'level',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          id: '0cfcfcb0-989e-481f-9cc1-10a69d82ff3f',
          licence: {
            id: '456',
            licenceRef: '02/02/02/3116'
          },
          licenceVersionPurposeCondition: {
            id: '3f01d2d9-d23b-4697-b215-2ee3836feabb',
            licenceVersionPurpose: {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartMonth: 1,
              abstractionPeriodStartDay: 1
            }
          }
        }
      ],
      riverName: 'A river'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly returns the data', async () => {
    const result = await DetermineLicenceMonitoringStationsService.go(monitoringStation.id)

    expect(result).to.equal({
      licenceMonitoringStations: [
        {
          abstractionPeriodEndDay: 1,
          abstractionPeriodEndMonth: 1,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 2,
          id: 'c4f6d976-3b18-44bc-b2b4-a649421faf2e',
          measureType: 'flow',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          licence: {
            id: '123',
            licenceRef: '01/01/01/6880'
          },
          thresholdGroup: 'flow-100-m3/s'
        },
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          id: '0cfcfcb0-989e-481f-9cc1-10a69d82ff3f',
          measureType: 'level',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          licence: {
            id: '456',
            licenceRef: '02/02/02/3116'
          },
          thresholdGroup: 'level-100-m3/s'
        }
      ],
      monitoringStationId: result.id,
      monitoringStationName: 'MONITOR PLACE',
      monitoringStationRiverName: 'A river'
    })
  })

  describe('the "licenceMonitoringStations" property', () => {
    it('should add a "thresholdGroup" to the licence station', async () => {
      const result = await DetermineLicenceMonitoringStationsService.go(monitoringStation.id)

      expect(result.licenceMonitoringStations[0].thresholdGroup).to.equal('flow-100-m3/s')
    })
  })

  describe('the "monitoringStationName" property', () => {
    it('should return the monitoring station name', async () => {
      const result = await DetermineLicenceMonitoringStationsService.go(monitoringStation.id)

      expect(result.monitoringStationName).to.equal('MONITOR PLACE')
    })
  })

  describe('the "monitoringStationRiverName" property', () => {
    it('should return the monitoring station river name', async () => {
      const result = await DetermineLicenceMonitoringStationsService.go(monitoringStation.id)

      expect(result.monitoringStationRiverName).to.equal('A river')
    })
  })
})
