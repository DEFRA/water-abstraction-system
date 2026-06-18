'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateUserId } = require('../../support/helpers/user.helper.js')
const { licenceEnds } = require('../../support/fixtures/licence.fixture.js')

// Things we need to stub
const FetchLicenceMonitoringStationsDal = require('../../../app/dal/monitoring-stations/fetch-licence-monitoring-stations.dal.js')

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

    licence = licenceEnds()

    licenceMonitoringStations = [
      {
        createdAt: new Date('2025-08-07T13:49:42.953Z'),
        id: generateUUID(),
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 500,
        latestNotification: {
          addressLine1: null,
          createdAt: '2025-08-26T21:22:05',
          id: generateUUID(),
          messageType: 'email',
          recipient: 'carol.shaw@atari.com',
          sendingAlertType: 'resume'
        },
        licenceVersionPurposeCondition: null,
        user: {
          id: generateUserId(),
          username: 'environment.officer@wrls.gov.uk'
        }
      },
      {
        createdAt: new Date('2025-08-06T13:49:42.951Z'),
        id: generateUUID(),
        restrictionType: 'stop',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licenceVersionPurposeCondition: {
          externalId: '9:99305:1:1234',
          id: generateUUID(),
          notes: 'This is the effect of restriction',
          licenceVersionPurpose: {
            id: generateUUID(),
            licenceVersion: {
              id: generateUUID(),
              status: 'current'
            }
          },
          licenceVersionPurposeConditionType: {
            id: generateUUID(),
            displayTitle: 'Rates m3 per day'
          }
        },
        user: {
          id: generateUserId(),
          username: 'environment.officer@wrls.gov.uk'
        }
      }
    ]
    monitoringStation = { id: generateUUID(), label: 'Hades', riverName: 'The River Styx' }

    Sinon.stub(FetchLicenceMonitoringStationsDal, 'go').resolves({
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
        backLink: {
          href: `/system/monitoring-stations/${monitoringStation.id}`,
          text: 'Go back to monitoring station'
        },
        lastAlertSentForLicence: 'Resume email on 26 August 2025 sent to carol.shaw@atari.com',
        licenceTags: [
          {
            actions: {
              items: [
                {
                  href: `/system/licence-monitoring-station/${licenceMonitoringStations[0].id}/remove`,
                  text: 'Remove tag',
                  visuallyHiddenText: 'Remove Reduce tag Created on 7 August 2025 by environment.officer@wrls.gov.uk'
                }
              ]
            },
            created: 'Created on 7 August 2025 by environment.officer@wrls.gov.uk',
            displaySupersededWarning: false,
            effectOfRestriction: null,
            lastAlertSent: 'Resume email on 26 August 2025 sent to carol.shaw@atari.com',
            licenceMonitoringStationId: licenceMonitoringStations[0].id,
            linkedCondition: 'Not linked to a condition',
            tag: 'Reduce tag',
            threshold: '500m3/s',
            type: 'Reduce'
          },
          {
            actions: {
              items: [
                {
                  href: `/system/licence-monitoring-station/${licenceMonitoringStations[1].id}/remove`,
                  text: 'Remove tag',
                  visuallyHiddenText: 'Remove Stop tag Created on 6 August 2025 by environment.officer@wrls.gov.uk'
                }
              ]
            },
            created: 'Created on 6 August 2025 by environment.officer@wrls.gov.uk',
            displaySupersededWarning: false,
            effectOfRestriction: 'This is the effect of restriction',
            lastAlertSent: '',
            licenceMonitoringStationId: licenceMonitoringStations[1].id,
            linkedCondition: 'Rates m3 per day, NALD ID 1234',
            tag: 'Stop tag',
            threshold: '100m3/s',
            type: 'Stop'
          }
        ],
        pageTitle: `Details for ${licence.licenceRef}`,
        pageTitleCaption: 'The River Styx at Hades',
        warning: null
      })
    })
  })
})
