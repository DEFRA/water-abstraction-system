'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchMonitoringStationDetailsService = require('../../../app/services/monitoring-stations/fetch-monitoring-station-details.service.js')

// Thing under test
const ViewService = require('../../../app/services/monitoring-stations/view.service.js')

describe('Monitoring Stations - View service', () => {
  let auth
  let licenceMonitoringStations
  let monitoringStation
  let yarStub

  beforeEach(() => {
    auth = auth = {
      credentials: {
        scope: ['billing', 'hof_notifications', 'manage_gauging_station_licence_links']
      }
    }

    monitoringStation = {
      catchmentName: null,
      gridReference: 'TL2664640047',
      id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
      label: 'BUSY POINT',
      riverName: null,
      stationReference: null,
      wiskiId: null
    }

    licenceMonitoringStations = [
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
          licenceRef: 'AT/TEST'
        },
        licenceVersionPurposeCondition: null
      }
    ]

    yarStub = { flash: Sinon.stub().returns(['Tag removed for 99/999/9999']) }

    Sinon.stub(FetchMonitoringStationDetailsService, 'go').resolves({ licenceMonitoringStations, monitoringStation })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewService.go(auth, monitoringStation.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        notification: 'Tag removed for 99/999/9999',
        backLink: { href: '/licences', text: 'Go back to search' },
        buttons: {
          createAlert: {
            href: '/system/notices/setup/alerts?monitoringStationId=f122d4bb-42bd-4af9-a081-1656f5a30b63'
          },
          tagLicence: { value: 'f122d4bb-42bd-4af9-a081-1656f5a30b63' }
        },
        gridReference: 'TL2664640047',
        pageTitle: 'BUSY POINT',
        pageTitleCaption: null,
        restrictionHeading: 'Flow restriction type and threshold',
        restrictions: [
          {
            action: {
              link: '/system/monitoring-stations/f122d4bb-42bd-4af9-a081-1656f5a30b63/licence/3cd1481c-e96a-45fc-8f2b-1849564b95a5',
              text: 'View'
            },
            abstractionPeriod: '1 April to 31 August',
            alert: '',
            alertDate: '',
            licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST',
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '100m3/s'
          }
        ],
        stationReference: '',
        wiskiId: ''
      })
    })
  })
})
