'use strict'

/**
 * Orchestrates sending the first main notice to Notify, recording the results, and checking the status when finished
 * @module SendMainNoticeService
 */

const CheckNotificationStatusService = require('../../../notifications/check-notification-status.service.js')
const NotificationModel = require('../../../../../app/models/notification.model.js')
const SendEmailNotificationService = require('./send-email-notification.service.js')
const SendLetterNotificationService = require('./send-letter-notification.service.js')
const SendPaperReturnService = require('./send-paper-return.service.js')
const UpdateNoticeService = require('../../update-notice.service.js')

const { pause } = require('../../../../lib/general.lib.js')

const notifyConfig = require('../../../../../config/notify.config.js')

/**
 * Orchestrates sending the first main notice to Notify, recording the results, and checking the status when finished
 *
 * @param {object} notice - The notice to be sent
 * @param {object[]} notifications - The notifications linked to the notice to be sent
 */
async function go(notice, notifications) {
  const { id: noticeId, referenceCode } = notice

  const sentNotifications = await _sendNotifications(notifications, referenceCode)

  // If we rush to check the status too quickly, Notify will respond with a result for emails that is 'still sending'.
  // The default wait is 5 seconds, which we have found is more than enough time.
  await pause(notifyConfig.waitForStatus)

  await _checkNotifications(sentNotifications)

  await UpdateNoticeService.go([noticeId])
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
    return SendEmailNotificationService.go(notification, referenceCode)
  }

  if (notification.messageRef === 'paper return') {
    return SendPaperReturnService.go(notification, referenceCode)
  }

  return SendLetterNotificationService.go(notification, referenceCode)
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

module.exports = {
  go
}
