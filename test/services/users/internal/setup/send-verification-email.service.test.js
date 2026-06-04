'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CheckNotificationStatusService = require('../../../../../app/services/notifications/check-notification-status.service.js')
const CreateEmailRequest = require('../../../../../app/requests/notify/create-email.request.js')
const GeneralLib = require('../../../../../app/lib/general.lib.js')
const NotifyConfig = require('../../../../../config/notify.config.js')
const NotifyUpdatePresenter = require('../../../../../app/presenters/notifications/notify-update.presenter.js')

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
  let notificationPatchStub
  let notifyUpdatePresenterStub
  let pauseStub

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

    notificationPatchStub = Sinon.stub().callsFake(function (updates) {
      Object.assign(notification, updates)
      return this
    })

    notification = {
      $query: Sinon.stub().returns({
        patch: notificationPatchStub
      }),
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

    // We have to set wait for status to 25ms to avoid the tests timing out. By default it would be 5 seconds and is
    // used to give Notify a chance to process the email notifications.
    Sinon.stub(NotifyConfig, 'waitForStatus').value(25)
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
      await SendVerificationEmailService.go(notification)

      const args = createEmailRequestStub.firstCall.args

      expect(createEmailRequestStub.calledOnce).to.be.true()
      expect(args[1]).to.equal(notification.recipient)
      expect(args[2]).to.equal({ personalisation: notification.personalisation })
    })

    it('records the Notify response to the notification', async () => {
      await SendVerificationEmailService.go(notification)

      expect(notificationPatchStub.calledOnce).to.be.true()
      expect(notificationPatchStub.firstCall.args[0]).to.equal({
        notifyError: undefined,
        notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
        notifyStatus: 'created',
        plaintext: verificationEmailPlaintext,
        status: 'pending'
      })
    })

    it('checks the status of the updated notification', async () => {
      await SendVerificationEmailService.go(notification)

      expect(checkNotificationStatusStub.calledOnce).to.be.true()
      const notificationPassedToCheck = checkNotificationStatusStub.firstCall.args[0]

      expect(notificationPassedToCheck).to.include({
        id: notificationId,
        notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
        notifyStatus: 'created',
        plaintext: verificationEmailPlaintext,
        status: 'pending'
      })
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
      await SendVerificationEmailService.go(notification)

      expect(notificationPatchStub.calledOnce).to.be.true()
      const patchData = notificationPatchStub.firstCall.args[0]

      expect(patchData.status).to.equal('error')
      expect(patchData.notifyError).to.exist()
    })

    it('does not wait or check the notification status', async () => {
      await SendVerificationEmailService.go(notification)

      expect(pauseStub.called).to.be.false()
      expect(checkNotificationStatusStub.called).to.be.false()
    })
  })
})
