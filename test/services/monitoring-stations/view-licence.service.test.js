'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchLicenceMonitoringStationsService = require('../../../app/services/monitoring-stations/fetch-licence-monitoring-stations.service.js')

// Thing under test
const ViewLicenceService = require('../../../app/services/monitoring-stations/view-licence.service.js')

describe('Monitoring Stations - View Licence service', () => {
  let auth
  let licence
  let licenceMonitoringStations
  let monitoringStation

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['billing', 'hof_notifications', 'manage_gauging_station_licence_links']
      }
    }
    licence = { id: '4f035ed9-b22d-4c6c-9ecb-3ec1bac43de5', licenceRef: '01/123' }
    licenceMonitoringStations = [
      {
        createdAt: new Date('2025-08-07T13:49:42.953Z'),
        id: '8c79ddbe-b8d8-477f-b2f5-1f729b095f80',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 500,
        latestNotification: {
          addressLine1: null,
          createdAt: '2025-08-26T21:22:05',
          id: 'dd7ac5eb-e0fb-44de-9819-b76b0669faca',
          messageType: 'email',
          recipient: 'carol.shaw@atari.com',
          sendingAlertType: 'resume'
        },
        licenceVersionPurposeCondition: null,
        user: {
          id: 100002,
          username: 'environment.officer@wrls.gov.uk'
        }
      },
      {
        createdAt: new Date('2025-08-06T13:49:42.951Z'),
        id: '7cbfb847-e666-4841-befc-d9bf3423c6ff',
        restrictionType: 'stop',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licenceVersionPurposeCondition: {
          externalId: '9:99305:1:1234',
          id: '3ce05856-c13a-4a6e-978b-fe9fdb4fe106',
          notes: 'This is the effect of restriction',
          licenceVersionPurpose: {
            id: 'df841d8b-153a-45dc-858d-d410f88fdb02',
            licenceVersion: {
              id: 'c371244e-224e-4ed0-84d7-6eb476cf0671',
              status: 'current'
            }
          },
          licenceVersionPurposeConditionType: {
            id: '4a142b01-5588-4dfc-9330-920c996babe0',
            displayTitle: 'Rates m3 per day'
          }
        },
        user: {
          id: 100002,
          username: 'environment.officer@wrls.gov.uk'
        }
      }
    ]
    monitoringStation = { id: 'b9b56105-aa8b-4015-b1a4-d50c6ba7436b', label: 'Hades', riverName: 'The River Styx' }

    Sinon.stub(FetchLicenceMonitoringStationsService, 'go').resolves({
      licence,
      licenceMonitoringStations,
      monitoringStation
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await ViewLicenceService.go(auth, licence.id, monitoringStation.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: '/system/monitoring-stations/b9b56105-aa8b-4015-b1a4-d50c6ba7436b',
          text: 'Go back to monitoring station'
        },
        lastAlertSentForLicence: 'Resume email on 26 August 2025 sent to carol.shaw@atari.com',
        licenceTags: [
          {
            actions: {
              items: [
                {
                  href: '/system/licence-monitoring-station/8c79ddbe-b8d8-477f-b2f5-1f729b095f80/remove',
                  text: 'Remove tag',
                  visuallyHiddenText: 'Remove Reduce tag Created on 7 August 2025 by environment.officer@wrls.gov.uk'
                }
              ]
            },
            created: 'Created on 7 August 2025 by environment.officer@wrls.gov.uk',
            displaySupersededWarning: false,
            effectOfRestriction: null,
            lastAlertSent: 'Resume email on 26 August 2025 sent to carol.shaw@atari.com',
            licenceMonitoringStationId: '8c79ddbe-b8d8-477f-b2f5-1f729b095f80',
            linkedCondition: 'Not linked to a condition',
            tag: 'Reduce tag',
            threshold: '500m3/s',
            type: 'Reduce'
          },
          {
            actions: {
              items: [
                {
                  href: '/system/licence-monitoring-station/7cbfb847-e666-4841-befc-d9bf3423c6ff/remove',
                  text: 'Remove tag',
                  visuallyHiddenText: 'Remove Stop tag Created on 6 August 2025 by environment.officer@wrls.gov.uk'
                }
              ]
            },
            created: 'Created on 6 August 2025 by environment.officer@wrls.gov.uk',
            displaySupersededWarning: false,
            effectOfRestriction: 'This is the effect of restriction',
            lastAlertSent: '',
            licenceMonitoringStationId: '7cbfb847-e666-4841-befc-d9bf3423c6ff',
            linkedCondition: 'Rates m3 per day, NALD ID 1234',
            tag: 'Stop tag',
            threshold: '100m3/s',
            type: 'Stop'
          }
        ],
        pageTitle: 'Details for 01/123',
        pageTitleCaption: 'The River Styx at Hades'
      })
    })
  })
})
