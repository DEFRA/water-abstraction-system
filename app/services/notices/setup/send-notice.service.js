'use strict'

/**
 * Orchestrates sending a notice to Notify, recording the results, and checking the status when finished
 * @module SendNoticeService
 */

const CheckNotificationStatusService = require('../../notifications/check-notification-status.service.js')
const CreateAlternateNoticeService = require('./create-alternate-notice.service.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const SendEmailService = require('./batch/send-email.service.js')
const SendLetterService = require('./batch/send-letter.service.js')
const SendPaperReturnService = require('./batch/send-paper-return.service.js')
const UpdateEventService = require('../../jobs/notification-status/update-event.service.js')

const { calculateAndLogTimeTaken, currentTimeInNanoseconds, pause } = require('../../../lib/general.lib.js')

const notifyConfig = require('../../../../config/notify.config.js')

/**
 * Orchestrates sending a notice to Notify, recording the results, and checking the status when finished
 *
 * @param {object} notice - The notice to be sent
 * @param {object[]} notifications - The notifications linked to the notice to be sent
 */
async function go(notice, notifications) {
  try {
    const startTime = currentTimeInNanoseconds()

    const { id: noticeId, referenceCode, subtype } = notice

    const sentNotifications = await _sendNotifications(notifications, referenceCode)

    // If we rush to check the status too quickly, Notify will respond with a result for emails that is 'still sending'.
    // The default wait is 5 seconds, which we have found is more than enough time.
    await pause(notifyConfig.waitForStatus)

    await _checkNotifications(sentNotifications)

    await UpdateEventService.go([noticeId])

    if (subtype === 'returnInvitation') {
      const { notifications: lettersToBeSent, referenceCode: lettersReferenceCode } =
        await CreateAlternateNoticeService.go(notice)

      if (lettersToBeSent.length > 0) {
        await _sendNotifications(lettersToBeSent, lettersReferenceCode)
        await _updateFailedEmailInvitations(noticeId)
      }
    }

    calculateAndLogTimeTaken(startTime, 'Send notice complete', { count: notifications.length, noticeId })
  } catch (error) {
    global.GlobalNotifier.omfg('Send notice failed', { notice }, error)
  }
}

async function _checkNotifications(notifications) {
  for (const notification of notifications) {
    if (notification.messageType === 'email') {
      // NOTE: CheckNotificationStatusService will handle ignoring errored notifications. So we just focus on checking
      // the message type here.
      await CheckNotificationStatusService.go(notification)
    }
  }
}

async function _recordResult(sendResult) {
  const { id, pdf, plaintext, notifyError, notifyId, notifyStatus, status } = sendResult

  await NotificationModel.query().patch({ pdf, plaintext, notifyError, notifyId, notifyStatus, status }).findById(id)
}

async function _sendNotification(notification, referenceCode) {
  if (notification.messageType === 'email') {
    return SendEmailService.go(notification, referenceCode)
  }

  if (notification.messageRef === 'pdf.return_form') {
    return SendPaperReturnService.go(notification, referenceCode)
  }

  return SendLetterService.go(notification, referenceCode)
}

async function _sendNotifications(notifications, referenceCode) {
  const sentNotifications = []

  for (const notification of notifications) {
    const result = await _sendNotification(notification, referenceCode)

    await _recordResult(result)

    // This means it was sent to Notify successfully. Else it errored or was rejected so we don't consider it
    // sent to Notify
    if (result.status === 'pending') {
      sentNotifications.push({
        ...notification,
        ...result
      })
    }
  }

  return sentNotifications
}

async function _updateFailedEmailInvitations(noticeId) {
  return NotificationModel.query()
    .patch({ alternateNoticeId: noticeId })
    .where('status', 'error')
    .where('messageRef', 'returns_invitation_primary_user_email')
    .where('eventId', noticeId)
    .where('messageType', 'email')
    .whereNull('alternateNoticeId')
}

module.exports = {
  go
}
