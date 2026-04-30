'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const UserFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const NotificationsTablePresenter = require('../../../app/presenters/users/notifications-table.presenter.js')

describe('Users - Notifications Table presenter', () => {
  let notifications
  let user

  beforeEach(() => {
    user = UserFixture.billingAndData()

    notifications = [
      NotificationsFixture.userNewInternalEmail(user.username),
      NotificationsFixture.userInternalPasswordResetEmail(user.username)
    ]
  })

  it('correctly presents the data', () => {
    const result = NotificationsTablePresenter.go(notifications, user.id)

    expect(result).to.equal([
      {
        link: {
          hiddenText: 'sent 18 April 2025 via email',
          href: `/system/users/internal/${user.id}/notifications/${notifications[0].id}`,
          text: 'New internal user'
        },
        method: 'Email',
        sentDate: '18 April 2025',
        status: 'sent'
      },
      {
        link: {
          hiddenText: 'sent 18 April 2025 via email',
          href: `/system/users/internal/${user.id}/notifications/${notifications[1].id}`,
          text: 'Password reset'
        },
        method: 'Email',
        sentDate: '18 April 2025',
        status: 'sent'
      }
    ])
  })

  describe('when there are no notifications', () => {
    it('returns an empty array', () => {
      const result = NotificationsTablePresenter.go([], user.id)

      expect(result).to.equal([])
    })
  })
})
