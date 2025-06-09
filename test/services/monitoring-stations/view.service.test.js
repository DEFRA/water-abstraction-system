'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchMonitoringStationService = require('../../../app/services/monitoring-stations/fetch-monitoring-station.service.js')

// Thing under test
const ViewService = require('../../../app/services/monitoring-stations/view.service.js')

describe('Monitoring Stations - View service', () => {
  let auth
  let monitoringStation
  let yarStub

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableLicenceMonitoringStationsSetup').value(true)
    Sinon.stub(FeatureFlagsConfig, 'enableLicenceMonitoringStationsView').value(true)

    auth = auth = {
      credentials: {
        scope: ['billing', 'hof_notifications', 'manage_gauging_station_licence_links']
      }
    }

    monitoringStation = {
      id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
      catchmentName: null,
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
    yarStub = { flash: Sinon.stub().returns(['Tag removed for 99/999/9999']) }

    Sinon.stub(FeatureFlagsConfig, 'enableMonitoringStationsAlertNotifications').value(true)
    Sinon.stub(FetchMonitoringStationService, 'go').resolves(monitoringStation)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewService.go(auth, monitoringStation.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        catchmentName: null,
        enableLicenceMonitoringStationsSetup: true,
        gridReference: 'TL2664640047',
        links: {
          createAlert: `/system/notices/setup?journey=abstraction-alert&monitoringStationId=${monitoringStation.id}`
        },
        monitoringStationId: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
        notification: 'Tag removed for 99/999/9999',
        pageTitle: 'BUSY POINT',
        permissionToManageLinks: true,
        permissionToSendAlerts: true,
        restrictionHeading: 'Flow restriction type and threshold',
        restrictions: [
          {
            action: {
              link: '/system/monitoring-stations/f122d4bb-42bd-4af9-a081-1656f5a30b63/licence/3cd1481c-e96a-45fc-8f2b-1849564b95a5',
              text: 'View'
            },
            abstractionPeriod: '1 April to 31 August',
            alert: null,
            alertDate: null,
            licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST',
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '100 m3/s'
          }
        ],
        stationReference: '',
        tableCaption: 'Licences linked to this monitoring station',
        wiskiId: ''
      })
    })
  })

  describe('when the "enableMonitoringStationsAlertNotifications" is false', () => {
    beforeEach(() => {
      Sinon.stub(FeatureFlagsConfig, 'enableMonitoringStationsAlertNotifications').value(false)
    })

    it('returns the link for the legacy water abstraction alert page', async () => {
      const result = await ViewService.go(auth, monitoringStation.id, yarStub)

      expect(result.links).to.equal({
        createAlert: `/monitoring-stations/${monitoringStation.id}/send-alert/alert-type`
      })
    })
  })
})
