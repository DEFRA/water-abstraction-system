// Test framework dependencies

// Things we need to stub
import CheckNotificationStatusService from '../../../../../app/services/notifications/check-notification-status.service.js'
import * as CreateEmailRequest from '../../../../../app/requests/notify/create-email.request.js'
import * as GeneralLib from '../../../../../app/lib/general.lib.js'
import GlobalNotifierStub from '../../../../support/stubs/global-notifier.stub.js'
import NotifyConfig from '../../../../../config/notify.config.js'
import NotifyUpdatePresenter from '../../../../../app/presenters/notifications/notify-update.presenter.js'
import UpdateNotificationDal from '../../../../../app/dal/users/internal/update-notification.dal.js'

// Thing under test
import SendVerificationEmailService from '../../../../../app/services/users/internal/setup/send-verification-email.service.js'

describe('Users - Internal - Setup - Send Verification Email service', () => {
  const notificationId = '46dd6e22-dfd3-4b2d-a618-ba88662db03e'
  const notifyId = '8af52d9f-e4ab-4c04-a49a-731439a8697e'
  const resetLink = 'https://internal.com/reset_password_change_password?resetGuid=6e7a6b97-f5c4-4c30-965e-ee67ee6d9f25'
  const verificationEmailPlaintext =
    'Dear new user,\r\n' +
    '\r\n' +
    'To complete your account set up, visit:\r\n' +
    'https://internal.com/reset_password_change_password?resetGuid=6e7a6b97-f5c4-4c30-965e-ee67ee6d9f25\r\n'
  let createEmailRequestStub
  let notification
  let notifierStub
  let pauseStub
  beforeEach(() => {
    vi.mock('../../../../../app/services/notifications/check-notification-status.service.js')
    CheckNotificationStatusService.mockResolvedValue()

    createEmailRequestStub = vi.spyOn(CreateEmailRequest, 'send').mockResolvedValue({
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

    vi.mock('../../../../../app/presenters/notifications/notify-update.presenter.js')

    pauseStub = vi.spyOn(GeneralLib, 'pause').mockResolvedValue()

    vi.mock('../../../../../app/dal/users/internal/update-notification.dal.js')
    UpdateNotificationDal.mockResolvedValue()

    // We have to set wait for status to 25ms to avoid the tests timing out. By default it would be 5 seconds and is
    // used to give Notify a chance to process the email notifications.
    vi.replaceProperty(NotifyConfig, 'waitForStatus', 25)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the email is sent to Notify successfully', () => {
    beforeEach(() => {
      NotifyUpdatePresenter.mockReturnValue({
        notifyId,
        notifyStatus: 'created',
        plaintext: verificationEmailPlaintext,
        status: 'pending'
      })
    })

    it('sends the email via Notify with the correct recipient and personalisation', async () => {
      await SendVerificationEmailService(notification)

      const args = createEmailRequestStub.mock.calls[0]

      expect(createEmailRequestStub).toHaveBeenCalledOnce()
      expect(args[1]).toEqual(notification.recipient)
      expect(args[2]).toEqual({ personalisation: notification.personalisation })
    })

    it('records the Notify response to the notification', async () => {
      await SendVerificationEmailService(notification)

      expect(UpdateNotificationDal).toHaveBeenCalledOnce()
      expect(UpdateNotificationDal.mock.calls[0][0]).toEqual(notification)
      expect(UpdateNotificationDal.mock.calls[0][1]).toEqual({
        notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
        notifyStatus: 'created',
        plaintext: verificationEmailPlaintext,
        status: 'pending'
      })
    })

    it('checks the status of the updated notification', async () => {
      await SendVerificationEmailService(notification)

      expect(CheckNotificationStatusService).toHaveBeenCalledOnce()
      const notificationPassedToCheck = CheckNotificationStatusService.mock.calls[0][0]

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

      NotifyUpdatePresenter.mockReturnValue({
        notifyError: errorMessage,
        status: 'error'
      })
    })

    it('records the error against the notification', async () => {
      await SendVerificationEmailService(notification)

      expect(UpdateNotificationDal).toHaveBeenCalledOnce()
      const patchData = UpdateNotificationDal.mock.calls[0][1]

      expect(patchData.status).toEqual('error')
      expect(patchData.notifyError).toBeDefined()
    })

    it('does not wait or check the notification status', async () => {
      await SendVerificationEmailService(notification)

      expect(pauseStub).not.toHaveBeenCalled()
      expect(CheckNotificationStatusService).not.toHaveBeenCalled()
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      CheckNotificationStatusService.mockRejectedValue()
    })

    it('handles the error', async () => {
      await SendVerificationEmailService(notification)

      const args = notifierStub.omfg.mock.calls[0]

      expect(args[0]).toEqual('Failed when trying to send internal user verification email')
      expect(args[1]).toEqual({ notification })
      expect(args[2]).toBeInstanceOf(Error)
    })
  })
})
