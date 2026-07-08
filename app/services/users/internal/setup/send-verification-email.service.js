/**
 * Orchestrates sending the verification email to the new user, recording the results, and checking the status
 * @module SendVerificationEmailService
 */

import CheckNotificationStatusService from '../../../notifications/check-notification-status.service.js'
import { send } from '../../../../requests/notify/create-email.request.js'
import NotifyUpdatePresenter from '../../../../presenters/notifications/notify-update.presenter.js'
import UpdateNotificationDal from '../../../../dal/users/internal/update-notification.dal.js'
import { pause } from '../../../../lib/general.lib.js'
import { NOTIFY_TEMPLATES } from '../../../../lib/notify-templates.lib.js'

import notifyConfig from '../../../../../config/notify.config.js'

/**
 * Orchestrates sending the verification email to the new user, recording the results, and checking the status
 *
 * @param {object} notification - The notification linked to the verification email to be sent
 */
async function go(notification) {
  try {
    const notificationStatus = await _sendEmail(notification)

    if (notificationStatus !== 'error') {
      // If we rush to check the status too quickly, Notify will respond with a result for emails that is 'still sending'.
      // The default wait is 5 seconds, which we have found is more than enough time.
      await pause(notifyConfig.waitForStatus)

      await CheckNotificationStatusService.go(notification)
    }
  } catch (error) {
    globalThis.GlobalNotifier.omfg(
      'Failed when trying to send internal user verification email',
      { notification },
      error
    )
  }
}

async function _createEmailRequest(notification) {
  const { personalisation, recipient } = notification

  const templateId = NOTIFY_TEMPLATES.users.verificationEmail

  const notifyResult = await send(templateId, recipient, { personalisation })

  return NotifyUpdatePresenter.go(notifyResult)
}

async function _sendEmail(notification) {
  const sendResult = await _createEmailRequest(notification)

  await UpdateNotificationDal(notification, sendResult)

  return sendResult.status
}

export {
  go
}
export default {
  go
}
