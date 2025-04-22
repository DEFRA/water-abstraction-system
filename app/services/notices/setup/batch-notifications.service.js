'use strict'

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 * @module BatchNotificationsService
 */

const { setTimeout } = require('node:timers/promises')

const CreateNotificationsService = require('./create-notifications.service.js')
const NotifyEmailRequest = require('../../../requests/notify/notify-email.request.js')
const NotifyLetterRequest = require('../../../requests/notify/notify-letter.request.js')
const NotifyUpdatePresenter = require('../../../presenters/notices/setup/notify-update.presenter.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')
const UpdateEventService = require('./update-event.service.js')

const NotifyConfig = require('../../../../config/notify.config.js')

/**
 * Orchestrates sending notifications to notify and saving the notification to 'water.scheduled_notifications'
 *
 * This service needs to perform the following actions on a recipient:
 * - convert the recipients into notifications
 * - send the notifications to Notify
 * - save the notifications to `water.scheduled_notifications`
 * - check the status of the notifications with Notify (sent or otherwise)
 * - update the notifications status in `water.scheduled_notifications` (with the updated Notify status)
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
 */
async function go(recipients, determinedReturnsPeriod, referenceCode, journey, eventId) {
  const { batchSize, delay } = NotifyConfig

  let error = 0

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batchRecipients = recipients.slice(i, i + batchSize)

    const batch = await _batch(batchRecipients, determinedReturnsPeriod, referenceCode, journey, eventId)

    await _delay(delay)

    error += batch.error
  }

  await UpdateEventService.go(eventId, error)
}

async function _batch(recipients, determinedReturnsPeriod, referenceCode, journey, eventId) {
  const notifications = NotificationsPresenter.go(recipients, determinedReturnsPeriod, referenceCode, journey, eventId)

  const toSendNotifications = _toSendNotifications(notifications)

  const sentNotifications = await _sentNotifications(toSendNotifications)

  await CreateNotificationsService.go(sentNotifications)

  return {
    error: _errorCount(sentNotifications)
  }
}

/**
 * The Notify service imposes the following rate limits:
 * 1. A maximum of 3,000 requests per minute.
 * 2. A maximum of 250 statuses returned per API call.
 *
 * To ensure we don't exceed these limits and to allow room for other parts of the system to utilize GOV.UK Notify,
 * we restrict our usage to **half** the rate limit. This means we will limit our bacth notifications requests to 1,500
 * requests per minute (3,000 / 2).
 *
 * Additionally, since the maximum number of statuses returned per API call is 250, we need to adjust our batch
 * processing mechanism to respect both rate limits:
 *
 * 1. **Requests per minute**: We are limiting ourselves to 1,500 requests per minute. Given that each status request
 * returns up to 250 statuses, this translates to a maximum of 6 batches per minute (1,500 requests / 250 statuses per
 * request = 6 batches).
 * 2. **Batch delay**: To ensure we stay within this 6-batch-per-minute constraint, we introduce a **10-second delay**
 * between each batch. This delay is calculated as:
 *    - 60 seconds (1 minute) / 6 batches = 10 seconds per batch.
 *
 * This delay ensures we don’t exceed 1,500 requests per minute, leaving enough room for other parts of the system to
 * make requests to the service.
 *
 * > The call to get the statues will count towards the rate limit. But to keep the explanation simple it has been
 * ignored. In reality the total calls per minute will be 1506 (6 additional calls to get the statues for each batch).
 *
 * @private
 */
async function _delay(delay) {
  return setTimeout(delay)
}

function _notification(notification, notifyResponse) {
  delete notification.reference
  delete notification.templateId

  return {
    ...notification,
    ...NotifyUpdatePresenter.go(notifyResponse)
  }
}

async function _sendLetter(notification) {
  const notifyResponse = await NotifyLetterRequest.send(notification.templateId, {
    personalisation: notification.personalisation,
    reference: notification.reference
  })

  return _notification(notification, notifyResponse)
}

async function _sendEmail(notification) {
  const notifyResponse = await NotifyEmailRequest.send(notification.templateId, notification.recipient, {
    personalisation: notification.personalisation,
    reference: notification.reference
  })

  return _notification(notification, notifyResponse)
}

async function _sentNotifications(toSendNotifications) {
  const settledPromises = await Promise.allSettled(toSendNotifications)

  return settledPromises.map((settledPromise) => {
    return settledPromise.value
  })
}

/**
 * Creates an array of promises to make requests to the relevant Notify service
 *
 * @private
 */
function _toSendNotifications(notifications) {
  const sentNotifications = []

  for (const notification of notifications) {
    if (notification.messageType === 'email') {
      sentNotifications.push(_sendEmail(notification))
    } else {
      sentNotifications.push(_sendLetter(notification))
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
