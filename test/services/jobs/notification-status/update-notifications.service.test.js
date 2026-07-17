// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import EventHelper from '../../../support/helpers/event.helper.js'
import NotificationHelper from '../../../support/helpers/notification.helper.js'
import { timestampForPostgres } from '../../../../app/lib/general.lib.js'

// Thing under test
import UpdateNotificationsService from '../../../../app/services/jobs/notification-status/update-notifications.service.js'

describe('Job - Notification Status - Update Notifications service', () => {
  let eventId
  let notifications
  let notification
  let notification2

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id

    notification = await NotificationHelper.add({
      createdAt: timestampForPostgres(),
      eventId,
      status: 'pending'
    })
  })

  describe('when updating a single notification', () => {
    beforeEach(async () => {
      notifications = [
        {
          createdAt: new Date(notification.createdAt),
          id: notification.id,
          notifyStatus: 'received',
          status: 'sent'
        }
      ]
    })

    it("updates only the notification's required values", async () => {
      await UpdateNotificationsService(notifications)

      const result = await notification.$query()

      expect(result).toEqual({
        alternateNoticeId: null,
        contactType: null,
        createdAt: new Date(notification.createdAt),
        dueDate: null,
        eventId,
        id: notification.id,
        licenceMonitoringStationId: null,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: 'received',
        pdf: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        returnedAt: null,
        returnLogIds: null,
        status: 'sent',
        templateId: null,
        updatedAt: new Date(notification.updatedAt)
      })
    })
  })

  describe('when updating multiple notifications', () => {
    beforeEach(async () => {
      notification2 = await NotificationHelper.add({
        createdAt: timestampForPostgres(),
        eventId,
        status: 'sending'
      })

      notifications = [
        {
          createdAt: new Date(notification.createdAt),
          id: notification.id,
          notifyStatus: 'received',
          status: 'sent'
        },
        {
          createdAt: new Date(notification2.createdAt),
          id: notification2.id,
          status: 'sent'
        }
      ]
    })

    it('updates the first notification', async () => {
      await UpdateNotificationsService(notifications)

      const result = await notification.$query()

      expect(result).toEqual({
        alternateNoticeId: null,
        contactType: null,
        createdAt: new Date(notification.createdAt),
        dueDate: null,
        eventId,
        id: notification.id,
        licenceMonitoringStationId: null,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: 'received',
        pdf: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        returnedAt: null,
        returnLogIds: null,
        status: 'sent',
        templateId: null,
        updatedAt: new Date(notification.updatedAt)
      })
    })

    it('updates the second notification', async () => {
      await UpdateNotificationsService(notifications)

      const result = await notification2.$query()

      expect(result).toEqual({
        alternateNoticeId: null,
        contactType: null,
        createdAt: new Date(notification2.createdAt),
        dueDate: null,
        eventId,
        id: notification2.id,
        licenceMonitoringStationId: null,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: null,
        pdf: null,
        personalisation: null,
        plaintext: null,
        recipient: null,
        returnedAt: null,
        returnLogIds: null,
        status: 'sent',
        templateId: null,
        updatedAt: new Date(notification2.updatedAt)
      })
    })
  })
})
