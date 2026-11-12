// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import EventHelper from 'water-abstraction-engine/test/helpers/event.helper.js'
import NotificationHelper from 'water-abstraction-engine/test/helpers/notification.helper.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'

// Thing under test
import FetchNotificationsDal from '../../../src/dal/company-contacts/fetch-notifications.dal.js'

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
      messageRef: 'password_reset_email',
      recipient: email
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
            event: {
              id: noticeTwo.id,
              issuer: noticeTwo.issuer,
              sendingAlertType: 'stop',
              subtype: noticeTwo.subtype
            },
            id: notificationTwo.id,
            messageType: notificationTwo.messageType,
            status: notificationTwo.status
          },
          {
            createdAt: notification.createdAt,
            event: {
              id: notice.id,
              issuer: notice.issuer,
              sendingAlertType: null,
              subtype: notice.subtype
            },
            id: notification.id,
            messageType: notification.messageType,
            status: notification.status
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
