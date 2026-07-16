// Test framework
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'
import NotificationHelper from '../../../support/helpers/notification.helper.js'
import { today } from '../../../../app/lib/general.lib.js'
import { yesterday } from '../../../support/general.js'

// Thing under test
import FetchNotificationsDal from '../../../../app/dal/users/external/fetch-notifications.dal.js'

describe('Users - External - Fetch Notifications DAL', () => {
  let notifications
  let user

  beforeEach(async () => {
    user = UsersFixture.external()

    // NOTE: Password resets can be sent to both internal and external accounts. We create both in this test to ensure
    // only the external ones are returned by the DAL. We also set createdAt to ensure the results are ordered as
    // expected.
    notifications = [
      // Should NOT be returned as is 'external' only
      await NotificationHelper.add(
        NotificationsFixture.userNewInternalEmail(user.username, { createdAt: yesterday() })
      ),
      // Should be returned, but below the external password reset
      await NotificationHelper.add(
        NotificationsFixture.userExternalShareExistingEmail(user.username, { createdAt: yesterday() })
      ),
      // Should be returned as the first result because it has the latest createdAt date
      await NotificationHelper.add(
        NotificationsFixture.userExternalPasswordResetEmail(user.username, { createdAt: today() })
      ),
      // Should NOT be returned, even though `password_reset_email` are set to both user types
      await NotificationHelper.add(
        NotificationsFixture.userInternalPasswordResetEmail(user.username, { createdAt: today() })
      )
    ]
  })

  afterAll(async () => {
    for (const notification of notifications) {
      await notification.$query().delete()
    }
  })

  describe('when the user has notifications', () => {
    it('returns the matching notifications and the total', async () => {
      const result = await FetchNotificationsDal(user.username)

      expect(result).toEqual({
        notifications: [
          {
            createdAt: notifications[2].createdAt,
            id: notifications[2].id,
            messageRef: 'password_reset_email',
            messageType: notifications[2].messageType,
            status: notifications[2].status
          },
          {
            createdAt: notifications[1].createdAt,
            id: notifications[1].id,
            messageRef: 'share_existing_user',
            messageType: notifications[1].messageType,
            status: notifications[1].status
          }
        ],
        totalNumber: 2
      })
    })
  })

  describe('when the user has no notifications', () => {
    it('returns an empty array and zero', async () => {
      const result = await FetchNotificationsDal('mystery.user@example.co.uk')

      expect(result).toEqual({ notifications: [], totalNumber: 0 })
    })
  })
})
