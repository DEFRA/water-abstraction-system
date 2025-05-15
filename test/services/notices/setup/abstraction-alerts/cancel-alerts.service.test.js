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
const CancelAlertsService = require('../../../../../app/services/notices/setup/abstraction-alerts/cancel-alerts.service.js')

describe('Cancel Alerts Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      ...AbstractionAlertSessionData.monitoringStation(),
      alertType: 'resume'
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CancelAlertsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
        caption: 'Death star',
        pageTitle: 'You are about to cancel this alert',
        summaryList: {
          text: 'Alert type',
          value: 'Resume'
        }
      })
    })
  })
})
