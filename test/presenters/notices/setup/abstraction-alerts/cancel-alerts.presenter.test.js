// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import CancelAlertsPresenter from '../../../../../app/presenters/notices/setup/abstraction-alerts/cancel-alerts.presenter.js'

describe('Notices - Setup - Abstraction Alerts - Cancel Alerts presenter', () => {
  let session

  beforeEach(() => {
    session = {
      ...AbstractionAlertSessionData.get(),
      alertType: 'resume'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelAlertsPresenter(session)

      expect(result).toEqual({
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
