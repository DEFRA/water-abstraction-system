// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import EventHelper from '../../support/helpers/event.helper.js'
import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationHelper from '../../support/helpers/notification.helper.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import FetchNotificationsDal from '../../../app/dal/company-contacts/fetch-notifications.dal.js'

describe('Company contact - Fetch Notifications DAL', () => {
  let notice
  let noticeTwo
  let notification
  let notificationTwo
  let email
  let excludedNotification

  beforeEach(async () => {
    // We want to ensure the email is unique so we do not pick up email seeded from other tests
    email = `${generateUUID()}@acme.co.uk`

    notice = await EventHelper.add(NoticesFixture.returnsInvitation())

    noticeTwo = await EventHelper.add(NoticesFixture.alertStop())

    notification = await NotificationHelper.add({
      ...NotificationsFixture.returnsInvitationEmail(notice),
      recipient: email
    })

    notificationTwo = await NotificationHelper.add({
      ...NotificationsFixture.abstractionAlertEmail(noticeTwo),
      recipient: email
    })

    // This should not be returned as it is an excluded message type
    excludedNotification = await NotificationHelper.add({
      ...NotificationsFixture.abstractionAlertEmail(notice),
      recipient: email,
      messageRef: 'password_reset_email'
    })
  })

  afterEach(async () => {
    await excludedNotification.$query().delete()
    await notice.$query().delete()
    await noticeTwo.$query().delete()
    await notification.$query().delete()
    await notificationTwo.$query().delete()
  })

  describe('when the company contact has notifications', () => {
    it('returns the matching notifications', async () => {
      const result = await FetchNotificationsDal(email)

      expect(result).toEqual({
        notifications: [
          {
            createdAt: notificationTwo.createdAt,
            id: notificationTwo.id,
            messageType: notificationTwo.messageType,
            status: notificationTwo.status,
            event: {
              id: noticeTwo.id,
              issuer: noticeTwo.issuer,
              subtype: noticeTwo.subtype,
              sendingAlertType: 'stop'
            }
          },
          {
            createdAt: notification.createdAt,
            id: notification.id,
            messageType: notification.messageType,
            status: notification.status,
            event: {
              id: notice.id,
              issuer: notice.issuer,
              subtype: notice.subtype,
              sendingAlertType: null
            }
          }
        ],
        totalNumber: 2
      })
    })
  })

  describe('when the company contact has no notifications', () => {
    beforeEach(() => {
      email = `${generateUUID()}@acme.co.uk`
    })

    it('returns no notifications', async () => {
      const result = await FetchNotificationsDal(email)

      expect(result).toEqual({
        notifications: [],
        totalNumber: 0
      })
    })
  })

  describe('when the company contact has no email', () => {
    beforeEach(() => {
      email = null
    })

    it('returns no notifications', async () => {
      const result = await FetchNotificationsDal(email)

      expect(result).toEqual({
        notifications: [],
        totalNumber: 0
      })
    })
  })
})
