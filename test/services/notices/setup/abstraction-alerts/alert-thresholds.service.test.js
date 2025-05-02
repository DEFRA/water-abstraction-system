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
const AlertThresholdsService = require('../../../../../app/services/notices/setup/abstraction-alerts/alert-thresholds.service.js')

describe('Notices Setup - Abstraction Alerts -  Alert Thresholds Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = AbstractionAlertSessionData.monitoringStation()

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AlertThresholdsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
        caption: 'Death star',
        pageTitle: 'Which thresholds do you need to send an alert for?',
        thresholdOptions: [
          {
            checked: false,
            hint: {
              text: 'Flow thresholds for this station (m)'
            },
            text: '1000 m',
            value: '0'
          },
          {
            checked: false,
            hint: {
              text: 'Level thresholds for this station (m3/s)'
            },
            text: '100 m3/s',
            value: '1'
          }
        ]
      })
    })
  })
})
