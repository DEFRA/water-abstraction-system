'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const CancelAlertsPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/cancel-alerts.presenter.js')

describe('Cancel Alerts Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      ...AbstractionAlertSessionData.monitoringStation(),
      alertType: 'resume'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelAlertsPresenter.go(session)

      expect(result).to.equal({
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
