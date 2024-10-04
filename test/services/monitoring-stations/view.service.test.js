'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchMonitoringStationService = require('../../../app/services/monitoring-stations/fetch-monitoring-station.service.js')

// Thing under test
const ViewService = require('../../../app/services/monitoring-stations/view.service.js')

describe('View service', () => {
  let auth
  let monitoringStationData
  let monitoringStationId

  beforeEach(() => {
    auth = _auth()
    monitoringStationData = _testFetchMonitoringStationData()
    monitoringStationId = monitoringStationData.id
  })

  describe('when a monitoring station with a matching ID exists', () => {
    beforeEach(() => {
      Sinon.stub(FetchMonitoringStationService, 'go').resolves(monitoringStationData)
    })

    it('returns the page data for the view', async () => {
      const result = await ViewService.go(auth, monitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'MEVAGISSEY FIRE STATION',
        monitoringStationId: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
        monitoringStationName: 'MEVAGISSEY FIRE STATION',
        gridReference: 'TL2664640047',
        permissionToManageLinks: true,
        permissionToSendAlerts: true,
        wiskiId: null,
        stationReference: null,
        licences: [
          {
            licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST',
            linkages: [
              {
                abstractionPeriod: '1 April to 31 August',
                alertType: 'Reduce',
                alertUpdatedAt: '3 June 2021',
                createdAt: new Date('2021-06-03T12:00:04.000Z'),
                id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
                lastUpdatedAt: null,
                licenceRef: 'AT/TEST',
                restrictionType: 'Flow',
                threshold: '100 m3/s'
              }
            ]
          }
        ]
      })
    })
  })
})

function _auth () {
  return {
    credentials: {
      roles: [
        {
          id: 'b62afe79-d599-4101-b374-729011711462',
          role: 'billing',
          description: 'Administer billing',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        },
        {
          id: 'e486f477-6bca-46b2-8af7-ed1046ab50d4',
          role: 'hof_notifications',
          description: 'Send HoF notifications',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        },
        {
          id: '311ab6d0-9c8e-44df-b472-ad8929f0db98',
          role: 'manage_gauging_station_licence_links',
          description: 'Manage linkages between gauging stations and licences',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        }
      ]
    }
  }
}

function _testFetchMonitoringStationData () {
  return {
    id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
    gridReference: 'TL2664640047',
    label: 'MEVAGISSEY FIRE STATION',
    riverName: null,
    stationReference: null,
    wiskiId: null,
    licenceGaugingStations: [
      {
        abstractionPeriodStartDay: '01',
        abstractionPeriodStartMonth: '04',
        abstractionPeriodEndDay: '31',
        abstractionPeriodEndMonth: '08',
        alertType: 'reduce',
        createdAt: new Date('2021-06-03 12:00:04.000'),
        restrictionType: 'flow',
        statusUpdatedAt: null,
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        licence: {
          id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceRef: 'AT/TEST'
        }
      }
    ]
  }
}
