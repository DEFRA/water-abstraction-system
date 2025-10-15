'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')

// Thing under test
const NotificationErrorPresenter = require('../../../app/presenters/notifications/notification-error.presenter.js')

describe('Notifications - Notification error presenter', () => {
  let notice
  let notification

  beforeEach(() => {
    notice = NoticesFixture.returnsInvitation()
    notification = NotificationsFixture.returnsInvitationEmail(notice)
    notification.event = notice
  })

  describe('when the notification does not have a status of "ERROR"', () => {
    it('returns null', () => {
      const result = NotificationErrorPresenter.go(notification)

      expect(result).to.be.null()
    })
  })

  describe('when the notification does have a status of "ERROR"', () => {
    beforeEach(() => {
      notification.status = 'error'
    })

    describe('and it is because of a "system" error', () => {
      beforeEach(() => {
        notification.notifyError =
          '{"error":"Notify error","message":"StatusCodeError: 500 - {"errors":[{"error":"TimeoutError","message":"Internal server error"}],"status_code":500}"}'
      })

      describe('when we tried to send it', () => {
        beforeEach(() => {
          notification.notifyStatus = null
        })

        it('returns generic error details', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'Not sent',
            description: 'Internal system error'
          })
        })
      })

      describe('after it has been sent', () => {
        it('returns the notify status and a generic error description details', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'delivered',
            description: 'Internal system error'
          })
        })
      })
    })

    describe('and it is because of a "Notify" error (was sent to Notify but has failed to send from them)', () => {
      beforeEach(() => {
        notification.notifyStatus = 'permanent-failure'
      })

      it('returns the notify status and a generic error description details', () => {
        const result = NotificationErrorPresenter.go(notification)

        expect(result).to.equal({
          status: 'permanent-failure',
          description: 'The provider could not deliver the message because the email address was wrong.'
        })
      })
    })
  })
})
