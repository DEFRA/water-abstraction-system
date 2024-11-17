'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchMonitoringStationService = require('../../../app/services/monitoring-stations/fetch-monitoring-station.service.js')

// Thing under test
const ViewService = require('../../../app/services/monitoring-stations/view.service.js')

describe('Monitoring Stations - View service', () => {
  let auth
  let monitoringStation

  beforeEach(() => {
    auth = auth = {
      credentials: {
        scope: [
          'billing',
          'hof_notifications',
          'manage_gauging_station_licence_links'
        ]
      }
    }

    monitoringStation = {
      id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
      gridReference: 'TL2664640047',
      label: 'BUSY POINT',
      riverName: null,
      stationReference: null,
      wiskiId: null,
      licenceMonitoringStations: [
        {
          id: '3ee344db-784c-4d21-8d53-e50833f7e848',
          abstractionPeriodEndDay: '31',
          abstractionPeriodEndMonth: '08',
          abstractionPeriodStartDay: '01',
          abstractionPeriodStartMonth: '04',
          licence: {
            id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST'
          },
          licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceVersionPurposeCondition: null,
          measureType: 'flow',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        }
      ]
    }

    Sinon.stub(FetchMonitoringStationService, 'go').resolves(monitoringStation)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewService.go(monitoringStation.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        gridReference: 'TL2664640047',
        monitoringStationId: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
        pageTitle: 'BUSY POINT',
        permissionToManageLinks: true,
        permissionToSendAlerts: true,
        restrictions: [
          {
            abstractionPeriod: '1 April to 31 August',
            alert: null,
            alertDate: null,
            licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST',
            measure: 'Flow',
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '100 m3/s'
          }
        ],
        stationReference: null,
        wiskiId: null
      })
    })
  })
})
