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
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
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
        activeNavBar: 'notices',
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
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.one.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.one.licence.id,
            licenceRef: licenceMonitoringStations.one.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.two.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.two.licence.id,
            licenceRef: licenceMonitoringStations.two.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove-threshold/${licenceMonitoringStations.three.id}`,
              text: 'Remove'
            },
            alert: '',
            alertDate: '',
            licenceId: licenceMonitoringStations.three.licence.id,
            licenceRef: licenceMonitoringStations.three.licence.licenceRef,
            restriction: 'Stop or reduce',
            restrictionCount: 1,
            threshold: '100m'
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
