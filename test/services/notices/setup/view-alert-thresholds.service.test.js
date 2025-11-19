'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewAlertThresholdsService = require('../../../../app/services/notices/setup/view-alert-thresholds.service.js')

describe('Notices - Setup - View Alert Thresholds service', () => {
  let session
  let sessionData
  let licenceMonitoringStations

  beforeEach(async () => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = {
      ...AbstractionAlertSessionData.get(licenceMonitoringStations),
      alertType: 'stop'
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertThresholdsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
          text: 'Back'
        },
        pageTitle: 'Which thresholds do you need to send an alert for?',
        pageTitleCaption: 'Death star',
        thresholdOptions: [
          {
            checked: false,
            hint: {
              text: 'Flow threshold'
            },
            text: '100m3/s',
            value: licenceMonitoringStations.two.thresholdGroup
          }
        ]
      })
    })
  })
})
