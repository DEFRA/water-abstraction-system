'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const CheckNotificationStatusService = require('../../../../../app/services/notifications/check-notification-status.service.js')
const CreateEmailRequest = require('../../../../../app/requests/notify/create-email.request.js')
const GeneralLib = require('../../../../../app/lib/general.lib.js')
const GlobalNotifierStub = require('../../../../support/stubs/global-notifier.stub.js')
const NotifyConfig = require('../../../../../config/notify.config.js')
const NotifyUpdatePresenter = require('../../../../../app/presenters/notifications/notify-update.presenter.js')
const UpdateNotificationDal = require('../../../../../app/dal/users/internal/update-notification.dal.js')

// Thing under test
const SendVerificationEmailService = require('../../../../../app/services/users/internal/setup/send-verification-email.service.js')

describe('Users - Internal - Setup - Send Verification Email service', () => {
  const notificationId = '46dd6e22-dfd3-4b2d-a618-ba88662db03e'
  const notifyId = '8af52d9f-e4ab-4c04-a49a-731439a8697e'
  const resetLink = 'https://internal.com/reset_password_change_password?resetGuid=6e7a6b97-f5c4-4c30-965e-ee67ee6d9f25'
  const verificationEmailPlaintext =
    'Dear new user,\r\n' +
    '\r\n' +
    'To complete your account set up, visit:\r\n' +
    'https://internal.com/reset_password_change_password?resetGuid=6e7a6b97-f5c4-4c30-965e-ee67ee6d9f25\r\n'

  let checkNotificationStatusStub
  let createEmailRequestStub
  let notification
  let notifierStub
  let notifyUpdatePresenterStub
  let pauseStub
  let updateNotificationDalStub

  beforeEach(() => {
    checkNotificationStatusStub = Sinon.stub(CheckNotificationStatusService, 'go').resolves()

    createEmailRequestStub = Sinon.stub(CreateEmailRequest, 'send').resolves({
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          id: notifyId,
          content: {
            body: verificationEmailPlaintext
          }
        }
      }
    })

    notification = {
      id: notificationId,
      messageRef: 'new_internal_user_email',
      messageType: 'email',
      personalisation: {
        unique_create_password_link: resetLink
      },
      recipient: 'new.user@environment-agency.gov.uk'
    }

    notifyUpdatePresenterStub = Sinon.stub(NotifyUpdatePresenter, 'go')

    pauseStub = Sinon.stub(GeneralLib, 'pause').resolves()

    updateNotificationDalStub = Sinon.stub(UpdateNotificationDal, 'go').resolves()

    // We have to set wait for status to 25ms to avoid the tests timing out. By default it would be 5 seconds and is
    // used to give Notify a chance to process the email notifications.
    Sinon.stub(NotifyConfig, 'waitForStatus').value(25)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the email is sent to Notify successfully', () => {
    beforeEach(() => {
      notifyUpdatePresenterStub.returns({
        notifyId,
        notifyStatus: 'created',
        plaintext: verificationEmailPlaintext,
        status: 'pending'
      })
    })

    it('sends the email via Notify with the correct recipient and personalisation', async () => {
      await SendVerificationEmailService(notification)

      const args = createEmailRequestStub.firstCall.args

      expect(createEmailRequestStub.calledOnce).toBe(true)
      expect(args[1]).toEqual(notification.recipient)
      expect(args[2]).toEqual({ personalisation: notification.personalisation })
    })

    it('records the Notify response to the notification', async () => {
      await SendVerificationEmailService(notification)

      expect(updateNotificationDalStub.calledOnce).toBe(true)
      expect(updateNotificationDalStub.firstCall.args[0]).toEqual(notification)
      expect(updateNotificationDalStub.firstCall.args[1]).toEqual({
        notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
        notifyStatus: 'created',
        plaintext: verificationEmailPlaintext,
        status: 'pending'
      })
    })

    it('checks the status of the updated notification', async () => {
      await SendVerificationEmailService(notification)

      expect(checkNotificationStatusStub.calledOnce).toBe(true)
      const notificationPassedToCheck = checkNotificationStatusStub.firstCall.args[0]

      expect(notificationPassedToCheck).toEqual(notification)
    })
  })

  describe('when the email send to Notify fails', () => {
    beforeEach(() => {
      const errorMessage = JSON.stringify({
        errors: [
          {
            error: 'ValidationError',
            message: 'email_address Not a valid email address'
          }
        ],
        message: 'Request failed with status code 400',
        status: 400
      })

      notifyUpdatePresenterStub.returns({
        notifyError: errorMessage,
        status: 'error'
      })
    })

    it('records the error against the notification', async () => {
      await SendVerificationEmailService(notification)

      expect(updateNotificationDalStub.calledOnce).toBe(true)
      const patchData = updateNotificationDalStub.firstCall.args[1]

      expect(patchData.status).toEqual('error')
      expect(patchData.notifyError).toBeDefined()
    })

    it('does not wait or check the notification status', async () => {
      await SendVerificationEmailService(notification)

      expect(pauseStub.called).toBe(false)
      expect(checkNotificationStatusStub.called).toBe(false)
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      checkNotificationStatusStub.rejects()
    })

    it('handles the error', async () => {
      await SendVerificationEmailService(notification)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).toEqual('Failed when trying to send internal user verification email')
      expect(args[1]).toEqual({ notification })
      expect(args[2]).toBeInstanceOf(Error)
    })
  })
})
