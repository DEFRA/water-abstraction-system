'use strict'

/**
 * Orchestrates sending the verification email to the new user, recording the results, and checking the status
 * @module SendVerificationEmailService
 */

const CheckNotificationStatusService = require('../../../notifications/check-notification-status.service.js')
const CreateEmailRequest = require('../../../../requests/notify/create-email.request.js')
const NotifyUpdatePresenter = require('../../../../presenters/notifications/notify-update.presenter.js')

const { pause } = require('../../../../lib/general.lib.js')

const notifyConfig = require('../../../../../config/notify.config.js')

const { NOTIFY_TEMPLATES } = require('../../../../lib/notify-templates.lib.js')

/**
 * Orchestrates sending the verification email to the new user, recording the results, and checking the status
 *
 * @param {object} notification - The notification linked to the verification email to be sent
 *
 * @returns {string} the status of the notification'
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

  const notifyResult = await CreateEmailRequest.send(templateId, recipient, { personalisation })

  return NotifyUpdatePresenter.go(notifyResult)
}

async function _recordResult(notification, sendResult) {
  const { notifyError, notifyId, notifyStatus, plaintext, status } = sendResult

  await notification.$query().patch({ notifyError, notifyId, notifyStatus, plaintext, status })
}

async function _sendEmail(notification) {
  const sendResult = await _createEmailRequest(notification)

  await _recordResult(notification, sendResult)

  return sendResult.status
}

module.exports = {
  go
}
