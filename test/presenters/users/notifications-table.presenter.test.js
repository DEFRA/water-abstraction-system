'use strict'

// Test helpers
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const NotificationsTablePresenter = require('../../../app/presenters/users/notifications-table.presenter.js')

describe('Users - Notifications Table presenter', () => {
  let notifications
  let type
  let user

  beforeEach(() => {
    user = UsersFixture.billingAndData()
    type = 'internal'

    notifications = [
      NotificationsFixture.userNewInternalEmail(user.username),
      NotificationsFixture.userInternalPasswordResetEmail(user.username)
    ]
  })

  it('correctly presents the data', () => {
    const result = NotificationsTablePresenter(notifications, user.id, type)

    expect(result).toEqual([
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

  describe('the "link" property', () => {
    describe('the "href" property', () => {
      describe('when the "type" is "internal"', () => {
        it('links to the internal user notification details page', () => {
          const result = NotificationsTablePresenter(notifications, user.id, 'internal')

          expect(result[0].link.href).toEqual(`/system/users/internal/${user.id}/notifications/${notifications[0].id}`)
        })
      })

      describe('when the "type" is "external"', () => {
        it('links to the external user notification details page', () => {
          const result = NotificationsTablePresenter(notifications, user.id, 'external')

          expect(result[0].link.href).toEqual(`/system/users/external/${user.id}/notifications/${notifications[0].id}`)
        })
      })
    })
  })

  describe('when there are no notifications', () => {
    it('returns an empty array', () => {
      const result = NotificationsTablePresenter([], user.id, type)

      expect(result).toEqual([])
    })
  })
})
