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
  const monitoringStationId = generateUUID()

  beforeEach(async () => {
    Sinon.stub(FetchMonitoringStationService, 'go').resolves({
      id: monitoringStationId,
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
            },
            notes: 'I have a bad feeling about this'
          }
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
          id: '0cfcfcb0-989e-481f-9cc1-10a69d8434',
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
            },
            notes: '"                   "             "                    "'
          }
        }
      ]
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly returns the data', async () => {
    const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

    expect(result).to.equal({
      licenceMonitoringStations: [
        {
          abstractionPeriodEndDay: 1,
          abstractionPeriodEndMonth: 1,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 2,
          id: 'c4f6d976-3b18-44bc-b2b4-a649421faf2e',
          measureType: 'flow',
          notes: null,
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
          notes: 'I have a bad feeling about this',
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
        },
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          id: '0cfcfcb0-989e-481f-9cc1-10a69d8434',
          licence: {
            id: '456',
            licenceRef: '02/02/02/3116'
          },
          measureType: 'level',
          notes: '"                   "             "                    "',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdGroup: 'level-100-m3/s',
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        }
      ],
      monitoringStationId,
      monitoringStationName: 'MONITOR PLACE'
    })
  })

  describe('the "licenceMonitoringStations" property', () => {
    it('should add a "thresholdGroup" to the licence station', async () => {
      const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

      expect(result.licenceMonitoringStations[0].thresholdGroup).to.equal('flow-100-m3/s')
    })
  })

  describe('the "notes" property', () => {
    describe('when there are "notes"', () => {
      it('should set the "notes"', async () => {
        const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

        expect(result.licenceMonitoringStations[1].notes).to.equal('I have a bad feeling about this')
      })
    })

    describe('when "notes" is null', () => {
      it('should default the "notes" to null when no notes is null', async () => {
        const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

        expect(result.licenceMonitoringStations[0].notes).to.equal(null)
      })
    })

    describe('when the "notes" is `"                   "             "                    "`', () => {
      it('should set the "notes"', async () => {
        const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

        expect(result.licenceMonitoringStations[2].notes).to.equal(
          '"                   "             "                    "'
        )
      })
    })
  })

  describe('the "monitoringStationName" property', () => {
    it('should return the monitoring station name', async () => {
      const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

      expect(result.monitoringStationName).to.equal('MONITOR PLACE')
    })
  })
})
