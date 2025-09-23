'use strict'

/**
 * Orchestrates sending notifications to Notify and saving the notification to 'water.scheduled_notifications'
 * @module BatchNotificationsService
 */

const { setTimeout } = require('node:timers/promises')

const AbstractionAlertNotificationsPresenter = require('../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js')
const CreateEmailRequest = require('../../../requests/notify/create-email.request.js')
const CreateLetterRequest = require('../../../requests/notify/create-letter.request.js')
const CreateNotificationsService = require('./create-notifications.service.js')
const CreatePrecompiledFileRequest = require('../../../requests/notify/create-precompiled-file.request.js')
const DetermineReturnFormsService = require('./determine-return-forms.service.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')
const NotifyUpdatePresenter = require('../../../presenters/notices/setup/notify-update.presenter.js')
const ProcessNotificationStatusService = require('../../jobs/notification-status/process-notification-status.service.js')
const UpdateEventService = require('./update-event.service.js')

const NotifyConfig = require('../../../../config/notify.config.js')

/**
 * Orchestrates sending notifications to Notify and saving the notification to 'water.scheduled_notifications'
 *
 * This service needs to perform the following actions on a recipient:
 *
 * - convert the recipients into notifications
 * - send the notifications to Notify
 * - save the notifications to `water.scheduled_notifications`
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
 * @param {object[]} recipients - The recipients to create notifications for
 * @param {SessionModel} session - The session instance
 * @param {string} eventId - the event UUID to link all the notifications to
 */
async function go(recipients, session, eventId) {
  const { batchSize, delay } = NotifyConfig

  let totalErrorCount = 0

  // NOTE: We can't use p-map to 'batch' up the sending as we have done in other modules because it does not allow us
  // to add a delay between each batch.
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batchRecipients = recipients.slice(i, i + batchSize)

    const errorCount = await _batch(batchRecipients, session, eventId)

    await _delay(delay)

    await ProcessNotificationStatusService.go(eventId)

    totalErrorCount += errorCount
  }

  await UpdateEventService.go(eventId, totalErrorCount)
}

async function _batch(recipients, session, eventId) {
  let notifications

  if (session.journey === 'alerts') {
    notifications = AbstractionAlertNotificationsPresenter.go(recipients, session, eventId)
  } else if (session.noticeType === 'returnForms') {
    notifications = await DetermineReturnFormsService.go(session, recipients, eventId)
  } else {
    notifications = NotificationsPresenter.go(recipients, session, eventId)
  }

  const notificationsToSend = _notificationsToSend(notifications)

  const sentNotifications = await _sendNotifications(notificationsToSend)

  await CreateNotificationsService.go(sentNotifications)

  return _errorCount(sentNotifications)
}

/**
 * This handles delaying sending the next batch by using a Node timeout.
 *
 * @private
 */
async function _delay(delay) {
  return setTimeout(delay)
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
function _notificationsToSend(notifications) {
  const sentNotifications = []

  for (const notification of notifications) {
    if (notification.messageType === 'email') {
      sentNotifications.push(_sendEmail(notification))
    } else if (notification.messageRef === 'pdf.return_form') {
      sentNotifications.push(_sendReturnForm(notification))
    } else {
      sentNotifications.push(_sendLetter(notification))
    }
  }

  return sentNotifications
}

async function _sendEmail(notification) {
  const notifyResult = await CreateEmailRequest.send(notification.templateId, notification.recipient, {
    personalisation: notification.personalisation,
    reference: notification.reference
  })

  return _sentNotification(notification, notifyResult)
}

async function _sendLetter(notification) {
  const notifyResult = await CreateLetterRequest.send(notification.templateId, {
    personalisation: notification.personalisation,
    reference: notification.reference
  })

  return _sentNotification(notification, notifyResult)
}

async function _sendReturnForm(notification) {
  const notifyResult = await CreatePrecompiledFileRequest.send(notification.content, notification.reference)

  return _sentNotification(notification, notifyResult)
}
/**
 * This removes some properties added just for sending the notifications, and then combines the original notification
 * with the result of the` NotifyUpdatePresenter`.
 *
 * The returned combination represents a 'notification' record, which the `CreateNotificationsService` can then insert
 * 'as is'.
 * @private
 */
function _sentNotification(notification, notifyResult) {
  delete notification.reference
  delete notification.templateId
  delete notification.content

  return {
    ...notification,
    ...NotifyUpdatePresenter.go(notifyResult)
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
