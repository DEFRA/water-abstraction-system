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
  let payload
  let session
  let sessionData

  describe('when called', () => {
    beforeEach(async () => {

      sessionData = {
        ...AbstractionAlertSessionData.monitoringStation(),
        alertType: 'stop'
      }

      payload = {
        'alert-thresholds': [sessionData.licenceMonitoringStations[0].id, sessionData.licenceMonitoringStations[1].id]
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
            'alert-thresholds': sessionData.licenceMonitoringStations[0].id
          }
        })

        it('saves the submitted value as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.alertThresholds).to.equal(['0'])
        })
      })

      describe('and more than one threshold has been selected ', () => {
        it('saves the submitted values as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.alertThresholds).to.equal(['0', '1'])
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('and there are no previous "alertThresholds"', () => {
      beforeEach(async () => {
        sessionData = AbstractionAlertSessionData.monitoringStation()

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
              value: '0',
              text: '1000 m',
              hint: {
                text: 'Flow thresholds for this station (m)'
              }
            },
            {
              checked: false,
              value: '1',
              text: '100 m3/s',
              hint: {
                text: 'Level thresholds for this station (m3/s)'
              }
            }
          ]
        })
      })
    })

    describe('and there are previous "alertThresholds"', () => {
      beforeEach(async () => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [abstractionAlertSessionData.licenceMonitoringStations[0].id]
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
              value: '0',
              text: '1000 m',
              hint: {
                text: 'Flow thresholds for this station (m)'
              }
            },
            {
              checked: false,
              value: '1',
              text: '100 m3/s',
              hint: {
                text: 'Level thresholds for this station (m3/s)'
              }
            }
          ]
        })
      })
    })
  })
})
