// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'

// Thing under test
import NotificationErrorPresenter from '../../../src/presenters/notifications/notification-error.presenter.js'

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
      const result = NotificationErrorPresenter(notification)

      expect(result).toBeNull()
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
        const result = NotificationErrorPresenter(notification)

        expect(result).toEqual({
          description: 'The provider could not deliver the message because the email address was wrong.',
          status: 'permanent-failure'
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
          const result = NotificationErrorPresenter(notification)

          expect(result).toEqual({
            description:
              'Address lines must not start with any of the following characters: @ ( ) = [ ] ” \\\\ / , < >',
            status: 'Failed to send to Notify'
          })
        })
      })

      describe('and it is a "known error" recorded by our code', () => {
        beforeEach(() => {
          notification.notifyError =
            '{"succeeded":false,"response":{"statusCode":400,"body":{"errors":[{"error":"ValidationError","message":"Last line of address must be a real UK postcode or another country"}],"status_code":400}}}'
        })

        it('returns our generic status and our own error description', () => {
          const result = NotificationErrorPresenter(notification)

          expect(result).toEqual({
            description: 'The last line of address must be a real UK postcode or another country',
            status: 'Failed to send to Notify'
          })
        })
      })

      describe('and it is an unknown error (does not matter which code recorded it)', () => {
        beforeEach(() => {
          notification.notifyError =
            '{"error":"Notify error","message":"StatusCodeError: 500 - {"errors":[{"error":"TimeoutError","message":"Internal server error"}],"status_code":500}"}'
        })

        it('returns our generic status and description', () => {
          const result = NotificationErrorPresenter(notification)

          expect(result).toEqual({
            description: 'Internal system error',
            status: 'Failed to send to Notify'
          })
        })
      })

      describe('but an empty string was logged', () => {
        beforeEach(() => {
          notification.notifyError = ''
        })

        it('returns our generic status and our "No error logged" description', () => {
          const result = NotificationErrorPresenter(notification)

          expect(result).toEqual({
            description: 'No error logged',
            status: 'Failed to send to Notify'
          })
        })
      })

      describe('but nothing was logged', () => {
        beforeEach(() => {
          notification.notifyError = null
        })

        it('returns our generic status and our "No error logged" description', () => {
          const result = NotificationErrorPresenter(notification)

          expect(result).toEqual({
            description: 'No error logged',
            status: 'Failed to send to Notify'
          })
        })
      })
    })
  })
})
