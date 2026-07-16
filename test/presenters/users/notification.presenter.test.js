// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import * as UsersFixture from '../../support/fixtures/users.fixture.js'

// Thing under test
import NotificationPresenter from '../../../app/presenters/users/notification.presenter.js'

describe('Users - Notification presenter', () => {
  let notification
  let superUser
  let type
  let user

  beforeEach(() => {
    user = UsersFixture.billingAndData()

    notification = NotificationsFixture.userInternalPasswordResetEmail(user.username)

    superUser = false

    type = 'internal'
  })

  it('correctly presents the data', () => {
    const result = NotificationPresenter(notification, user, type, superUser)

    expect(result).toEqual({
      backLink: { href: `/system/users/${type}/${user.id}/communications`, text: 'Go back to user' },
      contents: '## This content is protected.',
      errorDetails: null,
      messageType: 'email',
      pageTitle: 'Password reset',
      pageTitleCaption: user.username,
      sentDate: '18 April 2025',
      sentTo: notification.recipient,
      status: notification.status
    })
  })

  describe('the "contents" property', () => {
    describe('when "plaintext" is null', () => {
      beforeEach(() => {
        notification.plaintext = null
      })

      it('returns null', () => {
        const result = NotificationPresenter(notification, user, type, superUser)

        expect(result.contents).toBeNull()
      })
    })

    describe('when "plaintext" is populated', () => {
      describe('and the content is not protected', () => {
        beforeEach(() => {
          user = UsersFixture.rachelStevens()

          const recipient = UsersFixture.jonLee()

          notification = NotificationsFixture.userExternalShareExistingEmail(recipient.username, user.username)
        })

        it('returns the notification "plaintext"', () => {
          const result = NotificationPresenter(notification, user, type, superUser)

          expect(result.contents).toEqual(notification.plaintext)
        })
      })

      describe('and the content is protected', () => {
        describe('and the user is a super user', () => {
          beforeEach(() => {
            superUser = true
          })

          it('returns the notification "plaintext"', () => {
            const result = NotificationPresenter(notification, user, type, superUser)

            expect(result.contents).toEqual(notification.plaintext)
          })
        })

        describe('but the user is not a super user', () => {
          it('returns the a "content protected" message', () => {
            const result = NotificationPresenter(notification, user, type, superUser)

            expect(result.contents).toEqual('## This content is protected.')
          })
        })
      })
    })
  })
})
