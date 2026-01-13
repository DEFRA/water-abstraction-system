'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../support/fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const CancelAlertsPresenter = require('../../../../app/presenters/notices/setup/cancel-alerts.presenter.js')

describe('Notices - Setup - Cancel Alerts presenter', () => {
  let session

  beforeEach(() => {
    session = {
      ...AbstractionAlertSessionData.get(),
      alertType: 'resume'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelAlertsPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          text: 'Back'
        },
        pageTitle: 'You are about to cancel this alert',
        pageTitleCaption: 'Death star',
        summaryList: {
          text: 'Alert type',
          value: 'Resume'
        }
      })
    })
  })
})
