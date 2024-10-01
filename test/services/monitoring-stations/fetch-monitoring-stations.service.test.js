'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const MonitoringStationHelper = require('../../support/helpers/gauging-station.helper.js')
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-gauging-station.helper.js')

// Thing under test
const FetchMonitoringStationsService = require('../../../app/services/monitoring-stations/fetch-monitoring-stations.service.js')

describe.only('Fetch Monitoring Stations service', () => {
  let monitoringStation
  let monitoringStationId
  let licence
  let licenceId
  let licenceMonitoringStationOne
  let licenceMonitoringStationTwo
  let licenceMonitoringStationThree

  describe('when a monitoring station has linked licences', () => {
    before(async () => {
      licence = await LicenceHelper.add()
      licenceId = licence.id

      monitoringStation = await MonitoringStationHelper.add()
      monitoringStationId = monitoringStation.id

      licenceMonitoringStationOne = await LicenceMonitoringStationHelper.add({
        licenceId,
        gaugingStationId: monitoringStationId,
        createdAt: '2020-09-24 15:13:07.228'
      })

      licenceMonitoringStationTwo = await LicenceMonitoringStationHelper.add({
        licenceId,
        gaugingStationId: monitoringStationId,
        createdAt: '2022-09-24 15:13:07.228'
      })

      licenceMonitoringStationThree = await LicenceMonitoringStationHelper.add({
        licenceId,
        gaugingStationId: monitoringStationId,
        createdAt: '2022-09-24 15:13:07.228',
        statusUpdatedAt: '2024-09-24 15:13:07.228'
      })
    })

    it('returns the matching monitoring station, and linked licences in order of `createdAt` and `statusUpdatedAt`', async () => {
      const result = await FetchMonitoringStationsService.go(monitoringStationId)
      console.log('🚀🚀🚀 ~ licenceMonitoringStationThree:', licenceMonitoringStationThree)

      expect(result).to.equal({
        id: monitoringStationId,
        gridReference: 'TL2664640047',
        label: 'MEVAGISSEY FIRE STATION',
        riverName: null,
        stationReference: null,
        wiskiId: null,
        licenceGaugingStations: [
          {
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            alertType: 'reduce',
            createdAt: licenceMonitoringStationThree.createdAt,
            restrictionType: 'flow',
            statusUpdatedAt: licenceMonitoringStationThree.statusUpdatedAt,
            thresholdUnit: 'm3/s',
            thresholdValue: 100,
            licence: {
              id: licenceId,
              licenceRef: licence.licenceRef
            }
          },
          {
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            alertType: 'reduce',
            createdAt: licenceMonitoringStationTwo.createdAt,
            restrictionType: 'flow',
            statusUpdatedAt: null,
            thresholdUnit: 'm3/s',
            thresholdValue: 100,
            licence: {
              id: licenceId,
              licenceRef: licence.licenceRef
            }
          },
          {
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            alertType: 'reduce',
            createdAt: licenceMonitoringStationOne.createdAt,
            restrictionType: 'flow',
            statusUpdatedAt: null,
            thresholdUnit: 'm3/s',
            thresholdValue: 100,
            licence: {
              id: licenceId,
              licenceRef: licence.licenceRef
            }
          }
        ]
      })
    })
  })
})
