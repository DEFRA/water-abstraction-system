// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { NOTIFICATIONS_STATUS } from 'water-abstraction-engine/lib/notifications.lib.js'

import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import NotifyResponseFixture from '../../support/fixtures/notify-response.fixture.js'

// Things we need to stub
import GlobalNotifierStub from 'water-abstraction-engine/test/stubs/global-notifier.stub.js'
import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import * as ViewMessageDataRequest from 'water-abstraction-engine/requests/notify/view-message-data.request.js'

import * as RecordAlertSentDal from '../../../src/dal/licence-monitoring-station/record-alert-sent.dal.js'
import * as RecordInviteSentDal from '../../../src/dal/return-logs/record-invite-sent.dal.js'
import * as RecordNotifyErrorDal from '../../../src/dal/notifications/record-notify-error.dal.js'
import * as UpdateStatusDal from '../../../src/dal/notifications/update-status.dal.js'

// Thing under test
import CheckNotificationStatusService from '../../../src/services/notifications/check-notification-status.service.js'

describe('Notifications - Check Notification Status service', () => {
  const mockTrx = {}

  let notice
  let notification
  let notifierStub
  let notifyResponse

  beforeEach(() => {
    vi.spyOn(NotificationModel, 'transaction').mockImplementation(async (callback) => {
      return callback(mockTrx)
    })

    vi.spyOn(RecordAlertSentDal, 'default').mockResolvedValue()
    vi.spyOn(RecordInviteSentDal, 'default').mockResolvedValue()
    vi.spyOn(RecordNotifyErrorDal, 'default').mockResolvedValue()
    vi.spyOn(UpdateStatusDal, 'default').mockResolvedValue()

    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the notification is an "abstraction alert"', () => {
    beforeEach(() => {
      notice = NoticesFixture.alertStop()
      notification = NotificationsFixture.abstractionAlertEmail(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "sent" and records the Notify status', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).toHaveBeenCalledWith(
          notification.id,
          notifyResponse.response.body.status,
          NOTIFICATIONS_STATUS.sent,
          mockTrx
        )
      })

      it('updates the linked licence monitoring station record', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordAlertSentDal.default).toHaveBeenCalledWith(
          notification.licenceMonitoringStationId,
          notification.personalisation.sending_alert_type,
          notification.createdAt,
          mockTrx
        )
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'permanent-failure')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked licence monitoring station record', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns an unrecognised status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked licence monitoring station record', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('but the request to Notify fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the notification is a "paper return"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsPaperForm()
      notification = NotificationsFixture.paperReturn(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusPdfSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusPdfSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "sent" and records the Notify status', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).toHaveBeenCalledWith(
          notification.id,
          notifyResponse.response.body.status,
          NOTIFICATIONS_STATUS.sent,
          mockTrx
        )
      })

      describe('and the recipient is the "licence holder"', () => {
        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is the "primary user"', () => {
        beforeEach(() => {
          notification.contactType = 'primary user'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is a "single use" contact', () => {
        beforeEach(() => {
          notification.contactType = 'single use'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is an "additional contact"', () => {
        beforeEach(() => {
          notification.contactType = 'additional contact'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns agent" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns agent'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns to" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns user" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns user'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusPdfSuccessfulResponse(notice.referenceCode, 'permanent-failure')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns an unrecognised status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusPdfSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('but the request to Notify fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the notification is a "returns invitation"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notification = NotificationsFixture.returnsInvitationLetter(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "sent" and records the Notify status', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).toHaveBeenCalledWith(
          notification.id,
          notifyResponse.response.body.status,
          NOTIFICATIONS_STATUS.sent,
          mockTrx
        )
      })

      describe('and the recipient is the "licence holder"', () => {
        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is the "primary user"', () => {
        beforeEach(() => {
          notification.contactType = 'primary user'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is a "single use" contact', () => {
        beforeEach(() => {
          notification.contactType = 'single use'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is an "additional contact"', () => {
        beforeEach(() => {
          notification.contactType = 'additional contact'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns agent" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns agent'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns to" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns user" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns user'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'permanent-failure')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns an unrecognised status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('but the request to Notify fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the notification is a "returns invitation ad-hoc"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notification = NotificationsFixture.returnsInvitationAdHocEmail(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "sent" and records the Notify status', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).toHaveBeenCalledWith(
          notification.id,
          notifyResponse.response.body.status,
          NOTIFICATIONS_STATUS.sent,
          mockTrx
        )
      })

      describe('and the recipient is the "licence holder"', () => {
        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is the "primary user"', () => {
        beforeEach(() => {
          notification.contactType = 'primary user'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is a "single use" contact', () => {
        beforeEach(() => {
          notification.contactType = 'single use'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is an "additional contact"', () => {
        beforeEach(() => {
          notification.contactType = 'additional contact'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns agent" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns agent'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns to" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns user" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns user'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'permanent-failure')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns an unrecognised status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('but the request to Notify fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the notification is a "returns invitation alternate"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notification = NotificationsFixture.returnsInvitationAlternateLetter(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "sent" and records the Notify status', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).toHaveBeenCalledWith(
          notification.id,
          notifyResponse.response.body.status,
          NOTIFICATIONS_STATUS.sent,
          mockTrx
        )
      })

      describe('and the recipient is the "licence holder"', () => {
        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is the "primary user"', () => {
        beforeEach(() => {
          notification.contactType = 'primary user'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is a "single use" contact', () => {
        beforeEach(() => {
          notification.contactType = 'single use'
        })

        it('updates the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).toHaveBeenCalledWith(
            notification.returnLogIds,
            notification.dueDate,
            notification.createdAt,
            mockTrx
          )
        })
      })

      describe('and the recipient is an "additional contact"', () => {
        beforeEach(() => {
          notification.contactType = 'additional contact'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns agent" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns agent'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns to" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns to'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })

      describe('and the recipient is a "returns user" contact', () => {
        beforeEach(() => {
          notification.contactType = 'returns user'
        })

        it('does not update the linked return log records', async () => {
          await CheckNotificationStatusService(notification)

          expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        })
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'permanent-failure')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns an unrecognised status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('but the request to Notify fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the notification is a "returns reminder"', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notification = NotificationsFixture.returnsReminderEmail(notice)
      notification.status = 'pending'
    })

    describe('and Notify returns a "pending" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "sent" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "sent" and records the Notify status', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).toHaveBeenCalledWith(
          notification.id,
          notifyResponse.response.body.status,
          NOTIFICATIONS_STATUS.sent,
          mockTrx
        )
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a "failed" status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'permanent-failure')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns an unrecognised status', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('updates the status of the notification to "error" and records the error', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordNotifyErrorDal.default).toHaveBeenCalledWith({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })

      it('does not update the linked return log records', async () => {
        await CheckNotificationStatusService(notification)

        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
      })
    })

    describe('and Notify returns a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })

    describe('but the request to Notify fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('does nothing', async () => {
        await CheckNotificationStatusService(notification)

        expect(UpdateStatusDal.default).not.toHaveBeenCalled()
        expect(RecordAlertSentDal.default).not.toHaveBeenCalled()
        expect(RecordInviteSentDal.default).not.toHaveBeenCalled()
        expect(RecordNotifyErrorDal.default).not.toHaveBeenCalled()
      })
    })
  })
})
