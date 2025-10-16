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

    describe('because Notify reported an issue when sending (returned in our notification-status job)', () => {
      beforeEach(() => {
        notification.notifyStatus = 'permanent-failure'
      })

      it("returns the notify status and Notify's error description", () => {
        const result = NotificationErrorPresenter.go(notification)

        expect(result).to.equal({
          status: 'permanent-failure',
          description: 'The provider could not deliver the message because the email address was wrong.'
        })
      })
    })

    describe('because there was an issue when sending the notification to Notify', () => {
      beforeEach(() => {
        notification.notifyStatus = null
      })

      describe('and it is a "known error" recorded by the legacy code', () => {
        beforeEach(() => {
          notification.notifyError =
            '{"error":"Notify error","message":"StatusCodeError: 400 - {"errors":[{"error":"ValidationError","message":"Address lines must not start with any of the following characters: @ ( ) = [ ] ” \\\\ / , < >"}],"status_code":400}"}'
        })

        it('returns our generic status and our own error description', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'Failed to send to Notify',
            description: 'Address lines must not start with any of the following characters: @ ( ) = [ ] ” \\\\ / , < >'
          })
        })
      })

      describe('and it is a "known error" recorded by our code', () => {
        beforeEach(() => {
          notification.notifyError =
            '{"succeeded":false,"response":{"statusCode":400,"body":{"errors":[{"error":"ValidationError","message":"Last line of address must be a real UK postcode or another country"}],"status_code":400}}}'
        })

        it('returns our generic status and our own error description', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'Failed to send to Notify',
            description: 'The last line of address must be a real UK postcode or another country'
          })
        })
      })

      describe('and it is an unknown error (does not matter which code recorded it)', () => {
        beforeEach(() => {
          notification.notifyError =
            '{"error":"Notify error","message":"StatusCodeError: 500 - {"errors":[{"error":"TimeoutError","message":"Internal server error"}],"status_code":500}"}'
        })

        it('returns our generic status and description', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'Failed to send to Notify',
            description: 'Internal system error'
          })
        })
      })

      describe('but an empty string was logged', () => {
        beforeEach(() => {
          notification.notifyError = ''
        })

        it('returns our generic status and our "No error logged" description', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'Failed to send to Notify',
            description: 'No error logged'
          })
        })
      })

      describe('but nothing was logged', () => {
        beforeEach(() => {
          notification.notifyError = null
        })

        it('returns our generic status and our "No error logged" description', () => {
          const result = NotificationErrorPresenter.go(notification)

          expect(result).to.equal({
            status: 'Failed to send to Notify',
            description: 'No error logged'
          })
        })
      })
    })
  })
})
