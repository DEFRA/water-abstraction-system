'use strict'

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 * @module BatchNotificationsService
 */

const ReturnsNotificationPresenter = require('../../../presenters/notifications/setup/returns-notification.presenter.js')
const NotifyEmailService = require('../../notify/notify-email.service.js')
const NotifyLetterService = require('../../notify/notify-letter.service.js')

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 *
 * This service will:
 * - convert recipients into notifications
 * - send the notification to notify
 * - save the notifications to 'water.scheduled_notifications'
 * - check the status of the notifications with notify (sent or otherwise)
 * - returns the amount of successful and failed notifications
 * - will handle the notifications in batches
 *
 * @param {object[]} recipients
 * @param {object} determinedReturnsPeriod
 * @param {string} referenceCode
 * @param {string} journey
 *
 * @returns {object} - notifications success and failure count
 */
async function go(recipients, determinedReturnsPeriod, referenceCode, journey) {
  const notifications = ReturnsNotificationPresenter.go(recipients, determinedReturnsPeriod, referenceCode, journey)

  const toSendNotifications = _toSendNotifications(notifications)

  await Promise.allSettled(toSendNotifications)
}

// this should be a presenter - lift out comments below
// call it scheduled notification presenter
function _scheduledNotification(notifyData, recipient) {
  return {
    status: notifyData.status, // we might have our own internal statues ? look in legacy
    notificationId: notifyData.id,
    ...recipient
  }
}

// just update the notify id ? nothing else
// the notification presenter is going to need to handle the message refs etc -
// we do need to format the response so maybe that's a presenter ? notify id, message ref, string response etc
// only obvious loss is the licences from the notifications presenter (maybe not that big a deal)
async function _sendLetter(recipient) {
  const notifyData = await NotifyLetterService.go(recipient.templateId, recipient.options)
  return _scheduledNotification(notifyData, recipient)
}

async function _sendEmail(recipient) {
  const notifyData = await NotifyEmailService.go(recipient.templateId, recipient.emailAddress, recipient.options)
  return _scheduledNotification(notifyData, recipient)
}

/**
 * Creates an array of promises to make requests to the relevant notification service
 * @private
 */
function _toSendNotifications(notifications) {
  const sentNotifications = []

  for (const recipient of notifications) {
    if (recipient.emailAddress) {
      sentNotifications.push(_sendEmail(recipient))
    } else {
      sentNotifications.push(_sendLetter(recipient))
    }
  }

  return sentNotifications
}

module.exports = {
  go
}
