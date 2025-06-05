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
const SubmitAlertThresholdsService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js')

describe('Notices Setup - Abstraction Alerts - Alert Thresholds Submit Service', () => {
  let licenceMonitoringStations
  let payload
  let session
  let sessionData

  describe('when called', () => {
    beforeEach(async () => {
      licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

      sessionData = {
        ...AbstractionAlertSessionData.get(licenceMonitoringStations),
        alertType: 'stop'
      }

      payload = {
        'alert-thresholds': [licenceMonitoringStations.one.thresholdGroup, licenceMonitoringStations.two.thresholdGroup]
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('continues the journey', async () => {
      const result = await SubmitAlertThresholdsService.go(session.id, payload)

      expect(result).to.equal({})
    })

    describe('and updates the session ', () => {
      describe('and one threshold has been selected ', () => {
        beforeEach(() => {
          payload = {
            'alert-thresholds': licenceMonitoringStations.one.thresholdGroup
          }
        })

        it('saves the submitted value as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.alertThresholds).to.equal([licenceMonitoringStations.one.thresholdGroup])
        })
      })

      describe('and more than one threshold has been selected ', () => {
        it('saves the submitted values as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.alertThresholds).to.equal([
            licenceMonitoringStations.one.thresholdGroup,
            licenceMonitoringStations.two.thresholdGroup
          ])
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('and there are no previous "alertThresholds"', () => {
      beforeEach(async () => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.get()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [licenceMonitoringStations.one.thresholdGroup],
          alertType: 'stop'
        }

        payload = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertThresholdsService.go(session.id, payload)

        expect(result).to.equal({
          error: { text: 'Select applicable threshold(s)' },
          backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
          caption: 'Death star',
          pageTitle: 'Which thresholds do you need to send an alert for?',
          thresholdOptions: [
            {
              checked: false,
              hint: {
                text: 'Flow threshold'
              },
              text: '100 m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            },
            {
              checked: false,
              hint: {
                text: 'Level threshold'
              },
              text: '100 m',
              value: licenceMonitoringStations.three.thresholdGroup
            }
          ]
        })
      })
    })

    describe('and there are previous "alertThresholds"', () => {
      beforeEach(async () => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.get()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [licenceMonitoringStations.one.thresholdGroup],
          alertType: 'stop'
        }

        payload = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view, with errors, and all the thresholds unselected', async () => {
        const result = await SubmitAlertThresholdsService.go(session.id, payload)

        expect(result).to.equal({
          error: { text: 'Select applicable threshold(s)' },
          backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
          caption: 'Death star',
          pageTitle: 'Which thresholds do you need to send an alert for?',
          thresholdOptions: [
            {
              checked: false,
              hint: {
                text: 'Flow threshold'
              },
              text: '100 m3/s',
              value: licenceMonitoringStations.two.thresholdGroup
            },
            {
              checked: false,
              hint: {
                text: 'Level threshold'
              },
              text: '100 m',
              value: licenceMonitoringStations.three.thresholdGroup
            }
          ]
        })
      })
    })
  })
})
