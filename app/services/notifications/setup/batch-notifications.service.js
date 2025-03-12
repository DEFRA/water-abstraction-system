'use strict'

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 * @module BatchNotificationsService
 */

const NotifyEmailService = require('../../notify/notify-email.service.js')
const NotifyLetterService = require('../../notify/notify-letter.service.js')
const ScheduledNotificationsPresenter = require('../../../presenters/notifications/setup/scheduled-notifications.presenter.js')
const NotifyUpdatePresenter = require('../../../presenters/notifications/setup/notify-update.presenter.js')
const CreateNotificationsService = require('./create-notifications.service.js')

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 *
 * This service needs to perform the following actions on a recipient:
 * - convert the recipients into notifications
 * - send the notifications to Notify
 * - save the notifications to `water.scheduled_notifications`
 * - check the status of the notifications with Notify (sent or otherwise)
 * - update the notifications status in `water.scheduled_notifications` (with the updated Notify status)
 * - return the number of successful and failed notifications
 *
 * This will need to be done in batches because Notify has a rate limit (3,000 messages per minute). It also means the persisting of the notifications can use PostgreSQL's ability to batch insert (this is much greater than the Notify
 * rate limit).
 *
 * @param {object[]} recipients
 * @param {object} determinedReturnsPeriod
 * @param {string} referenceCode
 * @param {string} journey
 * @param {string} eventId - the event id to link all the notifications to an event
 *
 * @returns {object} - the number of sent and errored notifications
 */
async function go(recipients, determinedReturnsPeriod, referenceCode, journey, eventId) {
  const scheduledNotifications = ScheduledNotificationsPresenter.go(
    recipients,
    determinedReturnsPeriod,
    referenceCode,
    journey,
    eventId
  )

  const toSendNotifications = _toSendNotifications(scheduledNotifications)

  const sentNotifications = await _sentNotifications(toSendNotifications)

  await CreateNotificationsService.go(sentNotifications)

  return {
    sent: sentNotifications.length,
    error: _errorCount(sentNotifications)
  }
}

async function _sendLetter(scheduledNotification) {
  const notifyResponse = await NotifyLetterService.go(scheduledNotification.templateId, {
    personalisation: scheduledNotification.personalisation,
    reference: scheduledNotification.reference
  })

  return _scheduledNotification(scheduledNotification, notifyResponse)
}

async function _sendEmail(scheduledNotification) {
  const notifyResponse = await NotifyEmailService.go(
    scheduledNotification.templateId,
    scheduledNotification.recipient,
    {
      personalisation: scheduledNotification.personalisation,
      reference: scheduledNotification.reference
    }
  )

  return _scheduledNotification(scheduledNotification, notifyResponse)
}

async function _sentNotifications(toSendNotifications) {
  const settledPromises = await Promise.allSettled(toSendNotifications)

  return settledPromises.map((settledPromise) => settledPromise.value)
}

function _scheduledNotification(scheduledNotification, notifyResponse) {
  delete scheduledNotification.reference
  delete scheduledNotification.templateId

  return {
    createdAt: new Date(),
    ...scheduledNotification,
    ...NotifyUpdatePresenter.go(notifyResponse)
  }
}

/**
 * Creates an array of promises to make requests to the relevant Notify service
 * @private
 */
function _toSendNotifications(scheduledNotifications) {
  const sentNotifications = []

  for (const scheduledNotification of scheduledNotifications) {
    if (scheduledNotification.messageType === 'email') {
      sentNotifications.push(_sendEmail(scheduledNotification))
    } else {
      sentNotifications.push(_sendLetter(scheduledNotification))
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
  const erroredNotifications = notifications.filter((notification) => {
    return notification.notifyStatus !== 'created'
  })

  return erroredNotifications.length
}

module.exports = {
  go
}
