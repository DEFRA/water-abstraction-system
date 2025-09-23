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
const FetchMonitoringStationDetailsService = require('../../../../../app/services/monitoring-stations/fetch-monitoring-station-details.service.js')

// Thing under test
const DetermineLicenceMonitoringStationsService = require('../../../../../app/services/notices/setup/abstraction-alerts/determine-licence-monitoring-stations.service.js')

describe('Notices Setup - Abstraction Alerts - Determine Licence Monitoring Stations service', () => {
  const monitoringStationId = generateUUID()

  beforeEach(async () => {
    const monitoringStation = {
      catchmentName: null,
      gridReference: 'TL2664640047',
      id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
      label: 'BUSY POINT',
      riverName: null,
      stationReference: null,
      wiskiId: null
    }

    const licenceMonitoringStations = [
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 8,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        id: '3ee344db-784c-4d21-8d53-e50833f7e848',
        measureType: 'flow',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licence: {
          id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceRef: '01/01/01/6880'
        },
        licenceVersionPurposeCondition: null
      },
      {
        abstractionPeriodEndDay: null,
        abstractionPeriodEndMonth: null,
        abstractionPeriodStartDay: null,
        abstractionPeriodStartMonth: null,
        id: '0cfcfcb0-989e-481f-9cc1-10a69d82ff3f',
        measureType: 'level',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licence: {
          id: 'bcf94daa-50bc-4567-88a0-1f9e6cc79d42',
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
        id: '0cfcfcb0-989e-481f-9cc1-10a69d8434',
        measureType: 'level',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licence: {
          id: '039dccde-432d-4255-b788-73ac86d90d92',
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
    Sinon.stub(FetchMonitoringStationDetailsService, 'go').resolves({ licenceMonitoringStations, monitoringStation })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly returns the data', async () => {
    const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

    expect(result).to.equal({
      licenceMonitoringStations: [
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 8,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          id: '3ee344db-784c-4d21-8d53-e50833f7e848',
          measureType: 'flow',
          restrictionType: 'reduce',
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          latestNotification: null,
          licence: {
            id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: '01/01/01/6880'
          },
          notes: null,
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
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          latestNotification: null,
          licence: {
            id: 'bcf94daa-50bc-4567-88a0-1f9e6cc79d42',
            licenceRef: '02/02/02/3116'
          },
          notes: 'I have a bad feeling about this',
          thresholdGroup: 'level-100-m3/s'
        },
        {
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          id: '0cfcfcb0-989e-481f-9cc1-10a69d8434',
          measureType: 'level',
          restrictionType: 'reduce',
          thresholdUnit: 'm3/s',
          thresholdValue: 100,
          latestNotification: null,
          licence: {
            id: '039dccde-432d-4255-b788-73ac86d90d92',
            licenceRef: '02/02/02/3116'
          },
          notes: '"                   "             "                    "',
          thresholdGroup: 'level-100-m3/s'
        }
      ],
      monitoringStationId,
      monitoringStationName: 'BUSY POINT',
      monitoringStationRiverName: null
    })
  })

  describe('the "licenceMonitoringStations" property', () => {
    describe('the "notes" property', () => {
      describe('when there are "notes"', () => {
        it('returns the "notes"', async () => {
          const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

          expect(result.licenceMonitoringStations[1].notes).to.equal('I have a bad feeling about this')
        })
      })

      describe('when "notes" is null', () => {
        it('returns null', async () => {
          const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

          expect(result.licenceMonitoringStations[0].notes).to.equal(null)
        })
      })

      describe('when the "notes" is weird! `"                   "             "                    "`', () => {
        it('returns the weird notes', async () => {
          const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

          expect(result.licenceMonitoringStations[2].notes).to.equal(
            '"                   "             "                    "'
          )
        })
      })
    })

    describe('the "thresholdGroup" property', () => {
      it('generates a "thresholdGroup" for each licence monitoring station', async () => {
        const result = await DetermineLicenceMonitoringStationsService.go(monitoringStationId)

        expect(result.licenceMonitoringStations[0].thresholdGroup).to.equal('flow-100-m3/s')
      })
    })
  })
})
