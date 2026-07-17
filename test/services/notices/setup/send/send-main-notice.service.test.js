// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import NoticesFixture from '../../../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'

// Things we need to stub
import * as CheckNotificationStatusService from '../../../../../app/services/notifications/check-notification-status.service.js'
import * as SendEmailNotificationService from '../../../../../app/services/notices/setup/send/send-email-notification.service.js'
import * as SendLetterNotificationService from '../../../../../app/services/notices/setup/send/send-letter-notification.service.js'
import * as SendPaperReturnNotificationService from '../../../../../app/services/notices/setup/send/send-paper-return-notification.service.js'
import NotificationModel from '../../../../../app/models/notification.model.js'
import NotifyConfig from '../../../../../config/notify.config.js'

// Thing under test
import SendMainNoticeService from '../../../../../app/services/notices/setup/send/send-main-notice.service.js'

describe('Notices - Setup - Send - Send Main Notice service', () => {
  const emailPlaintext =
    'Dear licence holder contact,\r\n' +
    '\r\n' +
    '^ You must submit a record of your water abstraction. \r\n' +
    '\r\n' +
    '^ You’ll need to submit your returns by  2 December 2025.\r\n'

  const letterPlaintext =
    'Dear ACME Services Ltd,\r\n' +
    '\r\n' +
    '^ You must submit a record of your water abstraction. \r\n' +
    '\r\n' +
    '^ You’ll need to submit your returns by  2 December 2025.\r\n'
  let notice
  let notifications
  let notificationPatchStub

  beforeEach(() => {
    notifications = []

    notificationPatchStub = vi.fn().mockReturnThis()
    vi.spyOn(NotificationModel, 'query').mockReturnValue({
      patch: notificationPatchStub,
      findById: vi.fn().mockResolvedValue(),
      where: vi.fn().mockReturnThis(),
      whereNull: vi.fn().mockReturnThis()
    })

    vi.spyOn(CheckNotificationStatusService, 'default').mockResolvedValue()

    // We have to set wait for status to 25ms to avoid the tests timing out. By default it would be 5 seconds and is
    // used to give Notify a chance to process the email notifications.
    vi.replaceProperty(NotifyConfig, 'waitForStatus', 25)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when sending a notice that is not a Paper return (compiled PDF letter)', () => {
    beforeEach(() => {
      // Setup our notice and its notifications to match what SubmitCheckService will pass in
      notice = NoticesFixture.returnsInvitation()

      delete notice.metadata.error
      notice.metadata.recipients = 2

      let notification

      notification = NotificationsFixture.returnsInvitationLetter(notice)
      notifications.push({
        createdAt: notification.createdAt,
        id: notification.id,
        licenceMonitoringStationId: notification.licenceMonitoringStationId,
        messageRef: notification.messageRef,
        messageType: notification.messageType,
        pdf: notification.pdf,
        personalisation: notification.personalisation,
        recipient: notification.recipient,
        returnLogIds: notification.returnLogIds,
        templateId: notification.templateId
      })

      notification = NotificationsFixture.returnsInvitationEmail(notice)
      notifications.push({
        createdAt: notification.createdAt,
        id: notification.id,
        licenceMonitoringStationId: notification.licenceMonitoringStationId,
        messageRef: notification.messageRef,
        messageType: notification.messageType,
        pdf: notification.pdf,
        personalisation: notification.personalisation,
        recipient: notification.recipient,
        returnLogIds: notification.returnLogIds,
        templateId: notification.templateId
      })
    })

    describe('and all are sent to Notify successfully', () => {
      beforeEach(() => {
        vi.spyOn(SendEmailNotificationService, 'default').mockResolvedValue({
          id: notifications[1].id,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          plaintext: emailPlaintext,
          status: 'pending'
        })

        vi.spyOn(SendLetterNotificationService, 'default').mockResolvedValue({
          id: notifications[0].id,
          notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
          notifyStatus: 'created',
          plaintext: letterPlaintext,
          status: 'pending'
        })
      })

      it('sends the notice and records the Notify responses when all done', async () => {
        await SendMainNoticeService(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub).toHaveBeenCalledTimes(2)
        expect(notificationPatchStub.mock.calls[0][0]).toEqual({
          pdf: undefined,
          plaintext: letterPlaintext,
          notifyError: undefined,
          notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
          notifyStatus: 'created',
          status: 'pending'
        })
        expect(notificationPatchStub.mock.calls[1][0]).toEqual({
          pdf: undefined,
          plaintext: emailPlaintext,
          notifyError: undefined,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          status: 'pending'
        })
      })

      it('only checks the status of email notifications (letters are typically processed next day by Notify)', async () => {
        await SendMainNoticeService(notice, notifications)

        // We only check the notification status for emails
        expect(CheckNotificationStatusService.default).toHaveBeenCalledOnce()
        expect(CheckNotificationStatusService.default.mock.calls[0][0]).toEqual({
          ...notifications[1],
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          plaintext: emailPlaintext,
          status: 'pending'
        })
      })
    })

    describe('and a letter notification fails to send to Notify', () => {
      beforeEach(() => {
        vi.spyOn(SendEmailNotificationService, 'default').mockResolvedValue({
          id: notifications[1].id,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          plaintext: emailPlaintext,
          status: 'pending'
        })

        vi.spyOn(SendLetterNotificationService, 'default').mockResolvedValue({
          id: notifications[0].id,
          notifyError:
            '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"Last line of address must be a real UK postcode or another country"}]}',
          status: 'error'
        })
      })

      it('sends the notice and records the Notify responses, including errors when all done', async () => {
        await SendMainNoticeService(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub).toHaveBeenCalledTimes(2)
        expect(notificationPatchStub.mock.calls[0][0]).toEqual({
          pdf: undefined,
          plaintext: undefined,
          notifyError:
            '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"Last line of address must be a real UK postcode or another country"}]}',
          notifyId: undefined,
          notifyStatus: undefined,
          status: 'error'
        })
        expect(notificationPatchStub.mock.calls[1][0]).toEqual({
          pdf: undefined,
          plaintext: emailPlaintext,
          notifyError: undefined,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          status: 'pending'
        })
      })

      it('only checks the status of email notifications (letters are typically processed next day by Notify)', async () => {
        await SendMainNoticeService(notice, notifications)

        // NOTE: We still call CheckNotificationStatusService because we know it has logic to only check pending
        // notifications. So, we don't worry about that in SendNoticeService, even though we've rigged our test to fail
        // the email notification.
        expect(CheckNotificationStatusService.default).toHaveBeenCalledOnce()
        expect(CheckNotificationStatusService.default.mock.calls[0][0]).toEqual({
          ...notifications[1],
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          plaintext: emailPlaintext,
          status: 'pending'
        })
      })
    })

    describe('and an email notification fails to send to Notify', () => {
      beforeEach(() => {
        vi.spyOn(SendEmailNotificationService, 'default').mockResolvedValue({
          ...notifications[1],
          id: notifications[1].id,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyError:
            '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"email_address Not a valid email address"}]}',
          plaintext: emailPlaintext,
          status: 'error'
        })
      })

      it('sends the notice, records the Notify responses, including errors', async () => {
        await SendMainNoticeService(notice, [notifications[1]])

        expect(CheckNotificationStatusService.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when sending a notice that is a Paper return (compiled PDF letter)', () => {
    beforeEach(() => {
      // Setup our notice and its notifications to match what SubmitCheckService will pass in
      notice = NoticesFixture.returnsPaperForm()

      delete notice.metadata.error

      const notification = NotificationsFixture.paperReturn(notice)
      notifications.push({
        createdAt: notification.createdAt,
        id: notification.id,
        licenceMonitoringStationId: notification.licenceMonitoringStationId,
        messageRef: notification.messageRef,
        messageType: notification.messageType,
        pdf: notification.pdf,
        personalisation: notification.personalisation,
        recipient: notification.recipient,
        returnLogIds: notification.returnLogIds,
        templateId: notification.templateId
      })
    })

    describe('and it is sent to Notify successfully', () => {
      beforeEach(() => {
        vi.spyOn(SendPaperReturnNotificationService, 'default').mockResolvedValue({
          id: notifications[0].id,
          notifyId: '95296b09-fef6-4723-9716-e962fcd48e8f',
          notifyStatus: 'created',
          pdf: Buffer.from('mock file'),
          plaintext: null,
          status: 'pending'
        })
      })

      it('sends the notice and records the Notify response when all done', async () => {
        await SendMainNoticeService(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub).toHaveBeenCalledOnce()
        expect(notificationPatchStub.mock.calls[0][0]).toEqual({
          pdf: Buffer.from('mock file'),
          plaintext: null,
          notifyError: undefined,
          notifyId: '95296b09-fef6-4723-9716-e962fcd48e8f',
          notifyStatus: 'created',
          status: 'pending'
        })
      })

      it('does not try to check the status of the notification', async () => {
        await SendMainNoticeService(notice, notifications)

        // We only check the notification status for emails
        expect(CheckNotificationStatusService.default).not.toHaveBeenCalled()
      })
    })

    describe('and it fails to send to Notify', () => {
      beforeEach(() => {
        vi.spyOn(SendPaperReturnNotificationService, 'default').mockResolvedValue({
          id: notifications[0].id,
          notifyError: '{"status":404,"message":"Request failed with status code 404"}',
          pdf: Buffer.from('mock file'),
          status: 'error'
        })
      })

      it('sends the notice and records the Notify response when all done', async () => {
        await SendMainNoticeService(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub).toHaveBeenCalledOnce()
        expect(notificationPatchStub.mock.calls[0][0]).toEqual({
          pdf: Buffer.from('mock file'),
          plaintext: undefined,
          notifyError: '{"status":404,"message":"Request failed with status code 404"}',
          notifyId: undefined,
          notifyStatus: undefined,
          status: 'error'
        })
      })

      it('does not try to check the status of the notification', async () => {
        await SendMainNoticeService(notice, notifications)

        // We only check the notification status for emails
        expect(CheckNotificationStatusService.default).not.toHaveBeenCalled()
      })
    })
  })
})
