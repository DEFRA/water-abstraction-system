'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../fixtures/notifications.fixture.js')

// Things we need to stub
const CheckNotificationStatusService = require('../../../../../app/services/notifications/check-notification-status.service.js')
const NotificationModel = require('../../../../../app/models/notification.model.js')
const NotifyConfig = require('../../../../../config/notify.config.js')
const SendEmailService = require('../../../../../app/services/notices/setup/send/send-email.service.js')
const SendLetterService = require('../../../../../app/services/notices/setup/send/send-letter.service.js')
const SendPaperReturnService = require('../../../../../app/services/notices/setup/send/send-paper-return.service.js')
const UpdateNoticeService = require('../../../../../app/services/notices/update-notice.service.js')

// Thing under test
const SendMainNoticeService = require('../../../../../app/services/notices/setup/send/send-main-notice.service.js')

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

  let checkNotificationStatusStub
  let notice
  let notifications
  let notificationPatchStub
  let updateEventServiceStub

  beforeEach(() => {
    notifications = []

    notificationPatchStub = Sinon.stub().returnsThis()
    Sinon.stub(NotificationModel, 'query').returns({
      patch: notificationPatchStub,
      findById: Sinon.stub().resolves(),
      where: Sinon.stub().returnsThis(),
      whereNull: Sinon.stub().returnsThis()
    })

    checkNotificationStatusStub = Sinon.stub(CheckNotificationStatusService, 'go').resolves()
    updateEventServiceStub = Sinon.stub(UpdateNoticeService, 'go').resolves()

    // We have to set wait for status to 25ms to avoid the tests timing out. By default it would be 5 seconds and is
    // used to give Notify a chance to process the email notifications.
    Sinon.stub(NotifyConfig, 'waitForStatus').value(25)
  })

  afterEach(() => {
    Sinon.restore()
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
        Sinon.stub(SendEmailService, 'go').resolves({
          id: notifications[1].id,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          plaintext: emailPlaintext,
          status: 'pending'
        })

        Sinon.stub(SendLetterService, 'go').resolves({
          id: notifications[0].id,
          notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
          notifyStatus: 'created',
          plaintext: letterPlaintext,
          status: 'pending'
        })
      })

      it('sends the notice, records the Notify responses, and updates the notice when all done', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub.calledTwice).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal({
          pdf: undefined,
          plaintext: letterPlaintext,
          notifyError: undefined,
          notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
          notifyStatus: 'created',
          status: 'pending'
        })
        expect(notificationPatchStub.secondCall.args[0]).to.equal({
          pdf: undefined,
          plaintext: emailPlaintext,
          notifyError: undefined,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          status: 'pending'
        })

        // Check the notice is updated after all the sending and status checking steps are complete
        expect(updateEventServiceStub.calledOnce).to.be.true()
      })

      it('only checks the status of email notifications (letters are typically processed next day by Notify)', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // We only check the notification status for emails
        expect(checkNotificationStatusStub.calledOnce).to.be.true()
        expect(checkNotificationStatusStub.firstCall.args[0]).to.equal({
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
        Sinon.stub(SendEmailService, 'go').resolves({
          id: notifications[1].id,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          plaintext: emailPlaintext,
          status: 'pending'
        })

        Sinon.stub(SendLetterService, 'go').resolves({
          id: notifications[0].id,
          notifyError:
            '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"Last line of address must be a real UK postcode or another country"}]}',
          status: 'error'
        })
      })

      it('sends the notice, records the Notify responses, including errors, and updates the notice when all done', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub.calledTwice).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal({
          pdf: undefined,
          plaintext: undefined,
          notifyError:
            '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"Last line of address must be a real UK postcode or another country"}]}',
          notifyId: undefined,
          notifyStatus: undefined,
          status: 'error'
        })
        expect(notificationPatchStub.secondCall.args[0]).to.equal({
          pdf: undefined,
          plaintext: emailPlaintext,
          notifyError: undefined,
          notifyId: '46dd6e22-dfd3-4b2d-a618-ba88662db03e',
          notifyStatus: 'created',
          status: 'pending'
        })

        // Check the notice is updated after all the sending and status checking steps are complete
        expect(updateEventServiceStub.calledOnce).to.be.true()
      })

      it('only checks the status of email notifications (letters are typically processed next day by Notify)', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // NOTE: We still call CheckNotificationStatusService because we know it has logic to only check pending
        // notifications. So, we don't worry about that in SendNoticeService, even though we've rigged our test to fail
        // the email notification.
        expect(checkNotificationStatusStub.calledOnce).to.be.true()
        expect(checkNotificationStatusStub.firstCall.args[0]).to.equal({
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
        Sinon.stub(SendEmailService, 'go').resolves({
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
        await SendMainNoticeService.go(notice, [notifications[1]])

        expect(checkNotificationStatusStub.called).to.be.false()
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
        Sinon.stub(SendPaperReturnService, 'go').resolves({
          id: notifications[0].id,
          notifyId: '95296b09-fef6-4723-9716-e962fcd48e8f',
          notifyStatus: 'created',
          pdf: Buffer.from('mock file'),
          plaintext: null,
          status: 'pending'
        })
      })

      it('sends the notice, records the Notify response, and updates the notice when all done', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub.calledOnce).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal({
          pdf: Buffer.from('mock file'),
          plaintext: null,
          notifyError: undefined,
          notifyId: '95296b09-fef6-4723-9716-e962fcd48e8f',
          notifyStatus: 'created',
          status: 'pending'
        })

        // Check the notice is updated after all the sending and status checking steps are complete
        expect(updateEventServiceStub.calledOnce).to.be.true()
      })

      it('does not try to check the status of the notification', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // We only check the notification status for emails
        expect(checkNotificationStatusStub.called).to.be.false()
      })
    })

    describe('and it fails to send to Notify', () => {
      beforeEach(() => {
        Sinon.stub(SendPaperReturnService, 'go').resolves({
          id: notifications[0].id,
          notifyError: '{"status":404,"message":"Request failed with status code 404"}',
          pdf: Buffer.from('mock file'),
          status: 'error'
        })
      })

      it('sends the notice, records the Notify response, including errors, and updates the notice when all done', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // Check we record the Notify responses against the notifications
        expect(notificationPatchStub.calledOnce).to.be.true()
        expect(notificationPatchStub.firstCall.args[0]).to.equal({
          pdf: Buffer.from('mock file'),
          plaintext: undefined,
          notifyError: '{"status":404,"message":"Request failed with status code 404"}',
          notifyId: undefined,
          notifyStatus: undefined,
          status: 'error'
        })

        // Check the notice is updated after all the sending and status checking steps are complete
        expect(updateEventServiceStub.calledOnce).to.be.true()
      })

      it('does not try to check the status of the notification', async () => {
        await SendMainNoticeService.go(notice, notifications)

        // We only check the notification status for emails
        expect(checkNotificationStatusStub.called).to.be.false()
      })
    })
  })
})
