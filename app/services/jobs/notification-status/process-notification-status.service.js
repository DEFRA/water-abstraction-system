'use strict'

/**
 * Orchestrates the process of fetching and updating the status of 'notification' from the Notify service.
 * @module ProcessNotificationStatusService
 */

const { setTimeout } = require('node:timers/promises')

const FetchNotificationsService = require('./fetch-notifications.service.js')
const NotifyStatusPresenter = require('../../../presenters/jobs/notifications/notify-status.presenter.js')
const ViewMessageDataRequest = require('../../../requests/notify/view-message-data.request.js')
const UpdateAbstractionAlertsService = require('./update-abstraction-alerts.service.js')
const UpdateEventErrorCountService = require('./update-event-error-count.service.js')
const UpdateNotificationsService = require('./update-notifications.service.js')

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

const notifyConfig = require('../../../../config/notify.config.js')

/**
 * Orchestrates the process of fetching and updating the status of 'notification' from the Notify service.
 *
 * This function retrieves a list of 'notifications' and iterates over them to update their status according to the
 * latest information from Notify.
 *
 * The updates are done in batches to comply with rate-limiting constraints imposed by the Notify service. The rate
 * limit is set to 3,000 messages per minute, which the service respects during processing.
 *
 * If the number of 'notifications' exceeds the internal batch size limit, the notifications are split into smaller
 * batches for processing. This ensures efficient processing while adhering to the rate limit.
 *
 * If the request to Notify for the message details is successful, the status of the notification is updated. We always
 * record the Notify status in `notifyStatus`. We map it to a WRLS recognised value in `status`.
 *
 * - created or sending = 'pending'
 * - delivered = 'sent'
 * - permanent-failure, temporary-failure, technical-failure or error = 'error'
 *
 * The event record linked to the notification is then updated with the count of notifications with a status of 'error'.
 *
 * If the request to Notify for the message details fails, the notification is not updated. This means we can try again
 * later.
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const { batchSize, delay } = notifyConfig

    const notifications = await FetchNotificationsService.go()

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batchNotifications = notifications.slice(i, i + batchSize)

      const updatedNotifications = await _batch(batchNotifications)

      await UpdateAbstractionAlertsService.go(updatedNotifications)

      await _delay(delay)
    }

    await _updateEventErrorCount(notifications)

    calculateAndLogTimeTaken(startTime, 'Notification status job complete', { count: notifications.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Notification status job failed', null, error)
  }
}

async function _batch(notifications) {
  const toUpdateNotifications = _toUpdateNotifications(notifications)

  const updatedNotifications = await _updateNotifications(toUpdateNotifications)

  await UpdateNotificationsService.go(updatedNotifications)

  return updatedNotifications
}

async function _delay(delay) {
  return setTimeout(delay)
}

async function _notificationStatus(notification) {
  const notifyResult = await ViewMessageDataRequest.send(notification.notifyId)

  const { response, succeeded } = notifyResult

  if (succeeded) {
    const notifyStatus = NotifyStatusPresenter.go(response.body.status, notification)

    return {
      ...notification,
      ...notifyStatus
    }
  }

  return notification
}

/**
 * We need to dedupe the eventIds to ensure a performant query. Otherwise, we could have hundreds / thousands of
 * notifications with the same event id all triggering the same update.
 *
 * @private
 */
async function _updateEventErrorCount(notifications) {
  const eventIds = notifications.map((sn) => {
    return sn.eventId
  })

  const dedupeEventIds = [...new Set(eventIds)]

  await UpdateEventErrorCountService.go(dedupeEventIds)
}

async function _updateNotifications(toSendNotifications) {
  const settledPromises = await Promise.allSettled(toSendNotifications)

  return settledPromises.map((settledPromise) => {
    return settledPromise.value
  })
}

function _toUpdateNotifications(notifications) {
  const updateNotifications = []

  for (const notification of notifications) {
    updateNotifications.push(_notificationStatus(notification))
  }

  return updateNotifications
}

module.exports = {
  go
}
