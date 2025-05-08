'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const CheckLicenceMatchesService = require('../../../../../app/services/notices/setup/abstraction-alerts/check-licence-matches.service.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches Service', () => {
  let abstractionAlertSessionData
  let licenceMonitoringStation
  let licenceMonitoringStationSharedLicence
  let session

  beforeEach(async () => {
    abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStation = abstractionAlertSessionData.licenceMonitoringStations[0]
    licenceMonitoringStationSharedLicence = abstractionAlertSessionData.licenceMonitoringStations[1]

    session = await SessionHelper.add({ data: abstractionAlertSessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckLicenceMatchesService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`,
        caption: 'Death star',
        pageTitle: 'Check the licence matches for the selected thresholds',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: '/system',
              name: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStation.licenceId,
            licenceRef: licenceMonitoringStation.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000 m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: '/system',
              name: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationSharedLicence.licenceId,
            licenceRef: licenceMonitoringStationSharedLicence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 2,
            threshold: '100 m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: '/system',
              name: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationSharedLicence.licenceId,
            licenceRef: licenceMonitoringStationSharedLicence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 2,
            threshold: '100 m'
          }
        ]
      })
    })
  })
})
