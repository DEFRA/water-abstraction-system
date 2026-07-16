// Test framework
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NotificationHelper from '../../../support/helpers/notification.helper.js'
import NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'
import UsersFixture from '../../../support/fixtures/users.fixture.js'
import { today } from '../../../../app/lib/general.lib.js'
import { yesterday } from '../../../support/general.js'

// Thing under test
import FetchNotificationsDal from '../../../../app/dal/users/internal/fetch-notifications.dal.js'

describe('Users - Internal - Fetch Notifications DAL', () => {
  let notifications
  let user

  beforeEach(async () => {
    user = UsersFixture.billingAndData()

    // NOTE: Password resets can be sent to both internal and external accounts. We create both in this test to ensure
    // only the internal ones are returned by the DAL. We also set createdAt to ensure the results are ordered as
    // expected.
    notifications = [
      // Should be returned, but below the internal password reset
      await NotificationHelper.add(
        NotificationsFixture.userNewInternalEmail(user.username, { createdAt: yesterday() })
      ),
      // Should NOT be returned as is 'external' only
      await NotificationHelper.add(
        NotificationsFixture.userExternalShareExistingEmail(user.username, { createdAt: yesterday() })
      ),
      // Should NOT be returned, even though `password_reset_email` are set to both user types
      await NotificationHelper.add(
        NotificationsFixture.userExternalPasswordResetEmail(user.username, { createdAt: yesterday() })
      ),
      // Should be returned as the first result because it has the latest createdAt date
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
            createdAt: notifications[3].createdAt,
            id: notifications[3].id,
            messageRef: 'password_reset_email',
            messageType: notifications[3].messageType,
            status: notifications[3].status
          },
          {
            createdAt: notifications[0].createdAt,
            id: notifications[0].id,
            messageRef: 'new_internal_user_email',
            messageType: notifications[0].messageType,
            status: notifications[0].status
          }
        ],
        totalNumber: 2
      })
    })
  })

  describe('when the user has no notifications', () => {
    it('returns an empty array and zero', async () => {
      const result = await FetchNotificationsDal('mystery.user@wrls.gov.uk')

      expect(result).toEqual({ notifications: [], totalNumber: 0 })
    })
  })
})
