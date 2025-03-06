'use strict'

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 * @module BatchNotificationsService
 */

const NotifyEmailService = require('../../notify/notify-email.service.js')
const NotifyLetterService = require('../../notify/notify-letter.service.js')
const ReturnsNotificationPresenter = require('../../../presenters/notifications/setup/returns-notification.presenter.js')

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 *
 * This service needs to perform the following actions on a recipient:
 * - convert the recipients into notifications
 * - send the notification to notify
 * - save the notifications to 'water.scheduled_notifications'
 * - check the status of the notifications with notify (sent or otherwise)
 * - update the notifications status in 'water.scheduled_notifications' (with the updated notify status)
 * - return the amount of successful and failed notifications
 *
 * This will need to be done in batches because Notify has a rate limit (3,000 messages per minute), and the persisting of the
 * 'water.scheduled_notifications' uses postgresql's ability to insert with batches (this is much grater than the Notify
 * rate limit).
 *
 * @param {object[]} recipients
 * @param {object} determinedReturnsPeriod
 * @param {string} referenceCode
 * @param {string} journey
 *
 * @returns {object} - return the amount of sent and errored notifications
 */
async function go(recipients, determinedReturnsPeriod, referenceCode, journey) {
  const notifications = ReturnsNotificationPresenter.go(recipients, determinedReturnsPeriod, referenceCode, journey)

  const toSendNotifications = _toSendNotifications(notifications)

  const sentNotifications = await Promise.allSettled(toSendNotifications)

  const errorCount = _errorCount(sentNotifications)

  return {
    sent: sentNotifications.length,
    error: errorCount
  }
}

async function _sendLetter(recipient) {
  return NotifyLetterService.go(recipient.templateId, recipient.options)
}

async function _sendEmail(recipient) {
  return NotifyEmailService.go(recipient.templateId, recipient.emailAddress, recipient.options)
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

/**
 * Notify returns the status code. Anything other the '201' 'CREATED' is considered an error.
 *
 * We have a wrapper around Notify which will capture the error to allow multiple notifications to be sent without
 * failure.
 *
 * Our use of 'allSettled' result in the errors being classed as 'fulfilled'. This results in array of promises that
 * look like this:
 *
 * ```javascript
 * [
 *  {
 *    status: 'fulfilled',
 *    value: {}
 *  }
 * ]
 * ```
 *
 * We need to check the 'status' from notify to calculate if an error has occurred.
 *
 * @private
 */
function _errorCount(notifications) {
  return notifications.filter((notification) => notification.value.status !== 201).length
}

module.exports = {
  go
}
