'use strict'

/**
 * Orchestrates sending notifications to Notify and saving the notification to 'water.notifications'
 * @module BatchNotificationsService
 */

const { setTimeout } = require('node:timers/promises')

const ProcessNotificationStatusService = require('../../jobs/notification-status/process-notification-status.service.js')
const RecordNotifySendResultsService = require('./record-notify-send-results.service.js')
const SendEmailService = require('./batch/send-email.service.js')
const SendLetterService = require('./batch/send-letter.service.js')
const SendPaperReturnService = require('./batch/send-paper-return.service.js')
const UpdateEventService = require('./update-event.service.js')

const NotifyConfig = require('../../../../config/notify.config.js')

/**
 * Orchestrates sending notifications to Notify and saving the notification to 'water.notifications'
 *
 * This service needs to perform the following actions on a recipient:
 *
 * - convert the recipients into notifications
 * - send the notifications to Notify
 * - save the notifications to `water.notifications`
 * - update the linked event record with the count of notifications that failed to send to Notify
 *
 * This needs to be done in batches because Notify has a rate limit (3,000 messages per minute).
 *
 * To ensure compliance, we limit our batch notification requests to 1,500 requests per minute, which is half of the
 * Notify service's maximum allowed rate of 3,000 requests per minute. We also limit the number of batches sent per
 * minute to 6, with a 10-second delay between each batch, to stay within this rate limit.
 *
 * Batching also means we can batch insert the notifications when saving to PostgreSQL.
 *
 * @param {object[]} notifications - The notifications for sending and saving
 * @param {string} event - the event (notice) to link all the notifications to
 * @param {string} referenceCode - the unique generated reference code
 *
 */
async function go(notifications, event, referenceCode) {
  const totalErrorCount = 0

  const { batchSize, delay } = _batchSize(event.subtype)

  await _processBatches(notifications, delay, batchSize, event.id, referenceCode, totalErrorCount)

  await UpdateEventService.go(event.id, totalErrorCount)
}

async function _batch(notifications, referenceCode) {
  const notificationsToSend = _notificationsToSend(notifications, referenceCode)

  const sentNotifications = await _sendNotifications(notificationsToSend)

  await RecordNotifySendResultsService.go(sentNotifications)

  return _errorCount(sentNotifications)
}

/**
 * When sending a PDF file (currently we only send paper return's) we need to reduce the batch size to 1.
 *
 * This is to ease the burden on resources when generating the PDFs.
 *
 * Because we reduce the batch size to 1, we can reduce the delay to 2 seconds this will give us 30 requests per minute.
 *
 * @private
 */
function _batchSize(subtype) {
  if (subtype === 'paperReturnForms') {
    return {
      batchSize: 1,
      delay: 2000
    }
  }

  const { batchSize, delay } = NotifyConfig

  return {
    batchSize,
    delay
  }
}

/**
 * This handles delaying sending the next batch by using a Node timeout.
 *
 * @private
 */
async function _delay(delay) {
  return setTimeout(delay)
}

function _determineNotificationToSend(notification, referenceCode) {
  if (notification.messageType === 'email') {
    return SendEmailService.go(notification, referenceCode)
  }

  if (notification.messageRef === 'pdf.return_form') {
    return SendPaperReturnService.go(notification, referenceCode)
  }

  return SendLetterService.go(notification, referenceCode)
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

/**
 * Creates an array of promises to make requests to the relevant Notify service
 *
 * @private
 */
function _notificationsToSend(notifications, referenceCode) {
  const sentNotifications = []

  for (const notification of notifications) {
    sentNotifications.push(_determineNotificationToSend(notification, referenceCode))
  }

  return sentNotifications
}

async function _processBatches(notifications, delay, batchSize, eventId, referenceCode, totalErrorCount) {
  // NOTE: We can't use p-map to 'batch' up the sending as we have done in other modules because it does not allow us
  // to add a delay between each batch.
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batchNotifications = notifications.slice(i, i + batchSize)

    const errorCount = await _batch(batchNotifications, referenceCode)

    await _delay(delay)

    await ProcessNotificationStatusService.go(eventId)

    totalErrorCount += errorCount
  }
}

async function _sendNotifications(toSendNotifications) {
  const settledPromises = await Promise.allSettled(toSendNotifications)

  return settledPromises.map((settledPromise) => {
    return settledPromise.value
  })
}

module.exports = {
  go
}
