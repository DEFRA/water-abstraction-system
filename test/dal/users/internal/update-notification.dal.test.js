// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NotificationHelper from '../../../support/helpers/notification.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'
import { generateUserName } from '../../../support/generators.js'

// Thing under test
import UpdateNotificationDal from '../../../../app/dal/users/internal/update-notification.dal.js'

describe('Users - Internal - Update Notification DAL', () => {
  let notification
  let notificationData
  let sendResult

  beforeEach(async () => {
    notificationData = {
      messageRef: 'new_internal_user_email',
      messageType: 'email',
      personalisation: {
        unique_create_password_link:
          'https://internal.com/reset_password_change_password?resetGuid=2a595ee7-3ece-47b2-95c0-bea84efa7422'
      },
      recipient: generateUserName()
    }

    notification = await NotificationHelper.add(notificationData)
  })

  describe('when called with a successful send result', () => {
    beforeEach(() => {
      sendResult = {
        notifyId: generateUUID(),
        notifyStatus: 'created',
        plaintext: 'The email text',
        status: 'sent'
      }
    })

    it('updates the notification with the send result details', async () => {
      await UpdateNotificationDal(notification, sendResult)

      const result = await notification.$query()

      expect(result).toMatchObject({
        alternateNoticeId: null,
        contactType: null,
        createdAt: notification.createdAt,
        dueDate: null,
        eventId: null,
        id: notification.id,
        licenceMonitoringStationId: null,
        licences: null,
        messageRef: 'new_internal_user_email',
        messageType: 'email',
        notifyError: null,
        notifyId: sendResult.notifyId,
        notifyStatus: 'created',
        pdf: null,
        personalisation: {
          unique_create_password_link:
            'https://internal.com/reset_password_change_password?resetGuid=2a595ee7-3ece-47b2-95c0-bea84efa7422'
        },
        plaintext: 'The email text',
        recipient: notificationData.recipient,
        returnedAt: null,
        returnLogIds: null,
        status: 'sent',
        templateId: null
      })
    })
  })

  describe('when called with an error send result', () => {
    beforeEach(() => {
      sendResult = {
        notifyError: 'Notify error',
        status: 'error'
      }
    })

    it('updates the notification with the error details and failed status', async () => {
      await UpdateNotificationDal(notification, sendResult)

      const result = await notification.$query()

      expect(result).toMatchObject({
        alternateNoticeId: null,
        contactType: null,
        createdAt: notification.createdAt,
        dueDate: null,
        eventId: null,
        id: notification.id,
        licenceMonitoringStationId: null,
        licences: null,
        messageRef: 'new_internal_user_email',
        messageType: 'email',
        notifyError: 'Notify error',
        notifyId: null,
        notifyStatus: null,
        pdf: null,
        personalisation: {
          unique_create_password_link: `https://internal.com/reset_password_change_password?resetGuid=2a595ee7-3ece-47b2-95c0-bea84efa7422`
        },
        plaintext: null,
        recipient: notificationData.recipient,
        returnedAt: null,
        returnLogIds: null,
        status: 'error',
        templateId: null
      })
    })
  })
})
