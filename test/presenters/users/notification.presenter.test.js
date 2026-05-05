'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const NotificationPresenter = require('../../../app/presenters/users/notification.presenter.js')

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
    const result = NotificationPresenter.go(notification, user, type, superUser)

    expect(result).to.equal({
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
        const result = NotificationPresenter.go(notification, user, type, superUser)

        expect(result.contents).to.be.null()
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
          const result = NotificationPresenter.go(notification, user, type, superUser)

          expect(result.contents).to.equal(notification.plaintext)
        })
      })

      describe('and the content is protected', () => {
        describe('and the user is a super user', () => {
          beforeEach(() => {
            superUser = true
          })

          it('returns the notification "plaintext"', () => {
            const result = NotificationPresenter.go(notification, user, type, superUser)

            expect(result.contents).to.equal(notification.plaintext)
          })
        })

        describe('but the user is not a super user', () => {
          it('returns the a "content protected" message', () => {
            const result = NotificationPresenter.go(notification, user, type, superUser)

            expect(result.contents).to.equal('## This content is protected.')
          })
        })
      })
    })
  })
})
