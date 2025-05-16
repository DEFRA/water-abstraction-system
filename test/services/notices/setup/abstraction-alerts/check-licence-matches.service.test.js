'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const CheckLicenceMatchesService = require('../../../../../app/services/notices/setup/abstraction-alerts/check-licence-matches.service.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches Service', () => {
  let licenceMonitoringStationOne
  let licenceMonitoringStationThree
  let licenceMonitoringStationTwo
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStationOne = abstractionAlertSessionData.licenceMonitoringStations[0]
    licenceMonitoringStationTwo = abstractionAlertSessionData.licenceMonitoringStations[1]
    licenceMonitoringStationThree = abstractionAlertSessionData.licenceMonitoringStations[2]

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStationOne.thresholdGroup,
        licenceMonitoringStationTwo.thresholdGroup,
        licenceMonitoringStationThree.thresholdGroup
      ]
    }

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub().resolves() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckLicenceMatchesService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`,
        cancelLink: `/system/notices/setup/${session.id}/abstraction-alerts/cancel`,
        caption: 'Death star',
        notification: undefined,
        pageTitle: 'Check the licence matches for the selected thresholds',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStationOne.id}`,
              text: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationOne.licence.id,
            licenceRef: licenceMonitoringStationOne.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000 m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStationTwo.id}`,
              text: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationTwo.licence.id,
            licenceRef: licenceMonitoringStationTwo.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100 m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStationThree.id}`,
              text: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationThree.licence.id,
            licenceRef: licenceMonitoringStationThree.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100 m'
          }
        ]
      })
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().returns(['Test notification']) }
      })

      it('should set the notification', async () => {
        const result = await CheckLicenceMatchesService.go(session.id, yarStub)

        expect(result.notification).to.equal('Test notification')
      })
    })
  })
})
