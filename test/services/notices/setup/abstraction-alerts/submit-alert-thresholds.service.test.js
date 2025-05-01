'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../../test/support/helpers/session.helper.js')

// Thing under test
const SubmitAlertThresholdsService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-thresholds.service.js')

describe('Notices Setup - Abstraction Alerts -  Alert Thresholds Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { 'alert-thresholds': ['124-67'] }
    sessionData = AbstractionAlertSessionData.monitoringStation()

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAlertThresholdsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({})
    })

    it('continues the journey', async () => {
      const result = await SubmitAlertThresholdsService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitAlertThresholdsService.go(session.id, payload)

      expect(result).to.equal({
        error: { text: 'Select applicable threshold(s)' },
        backLink: `/system/notices/setup/${sessionData.monitoringStationId}/abstraction-alerts/alert-type`,
        caption: 'Death star',
        pageTitle: 'Which thresholds do you need to send an alert for?',
        thresholdOptions: [
          {
            checked: false,
            value: '123/567-100m',
            text: '1000 m',
            hint: {
              text: 'Flow thresholds for this station (m)'
            }
          },
          {
            checked: false,
            value: '123/567-100m',
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
