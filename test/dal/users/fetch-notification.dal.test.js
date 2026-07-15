// Test helpers
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import * as UsersFixture from '../../support/fixtures/users.fixture.js'
import NotificationHelper from '../../support/helpers/notification.helper.js'

// Thing under test
import FetchNotificationDal from '../../../app/dal/users/fetch-notification.dal.js'

describe('Users - Fetch Notification DAL', () => {
  let notification
  let user

  beforeAll(async () => {
    user = UsersFixture.billingAndData()
  })

  afterEach(async () => {
    if (notification) {
      await notification.$query().delete()
    }
  })

  describe('when a matching notification exists', () => {
    beforeEach(async () => {
      notification = await NotificationHelper.add(NotificationsFixture.userInternalPasswordResetEmail(user.username))
    })

    it('returns the matching notification', async () => {
      const result = await FetchNotificationDal(notification.id, user.id)

      expect(result).toEqual({
        createdAt: notification.createdAt,
        id: notification.id,
        messageRef: 'password_reset_email',
        messageType: 'email',
        notifyError: null,
        notifyStatus: 'delivered',
        personalisation: notification.personalisation,
        plaintext: notification.plaintext,
        recipient: 'billing.data@wrls.gov.uk',
        status: 'sent'
      })
    })
  })

  describe('when a matching notification does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchNotificationDal('317aaa08-723d-4cb3-8f3b-5ab6a37b573f', user.id)

      expect(result).toBeUndefined()
    })
  })
})
