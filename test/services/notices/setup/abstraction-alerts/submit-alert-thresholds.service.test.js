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
  let alertThresholdGroupOne
  let alertThresholdGroupThree
  let alertThresholdGroupTwo
  let payload
  let session
  let sessionData

  describe('when called', () => {
    beforeEach(async () => {
      sessionData = {
        ...AbstractionAlertSessionData.monitoringStation(),
        alertType: 'stop'
      }

      alertThresholdGroupOne = sessionData.licenceMonitoringStations[0].thresholdGroup
      alertThresholdGroupTwo = sessionData.licenceMonitoringStations[1].thresholdGroup
      alertThresholdGroupThree = sessionData.licenceMonitoringStations[2].thresholdGroup

      payload = {
        'alert-thresholds': [alertThresholdGroupOne, alertThresholdGroupTwo]
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
            'alert-thresholds': alertThresholdGroupOne
          }
        })

        it('saves the submitted value as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.alertThresholds).to.equal([alertThresholdGroupOne])
        })
      })

      describe('and more than one threshold has been selected ', () => {
        it('saves the submitted values as an array', async () => {
          await SubmitAlertThresholdsService.go(session.id, payload)

          const refreshedSession = await session.$query()

          expect(refreshedSession.alertThresholds).to.equal([alertThresholdGroupOne, alertThresholdGroupTwo])
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('and there are no previous "alertThresholds"', () => {
      beforeEach(async () => {
        const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

        sessionData = {
          ...abstractionAlertSessionData,
          alertThresholds: [alertThresholdGroupOne],
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
              value: alertThresholdGroupTwo
            },
            {
              checked: false,
              hint: {
                text: 'Level threshold'
              },
              text: '100 m',
              value: alertThresholdGroupThree
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
          alertThresholds: [alertThresholdGroupOne],
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
              value: alertThresholdGroupTwo
            },
            {
              checked: false,
              hint: {
                text: 'Level threshold'
              },
              text: '100 m',
              value: alertThresholdGroupThree
            }
          ]
        })
      })
    })
  })
})
