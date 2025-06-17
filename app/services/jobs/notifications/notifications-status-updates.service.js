'use strict'

/**
 * Orchestrates the process of fetching and updating the status of 'notification' from the Notify service.
 * @module ProcessNotificationsStatusUpdatesService
 */

const { setTimeout } = require('node:timers/promises')

const FetchNotificationsService = require('./fetch-notifications.service.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const NotifyStatusPresenter = require('../../../presenters/jobs/notifications/notify-status.presenter.js')
const NotifyStatusRequest = require('../../../requests/notify/notify-status.request.js')
const UpdateAbstractionAlertsService = require('./update-abstraction-alerts.service.js')
const UpdateEventErrorCountService = require('./update-event-error-count.service.js')
const UpdateNotificationsService = require('./update-notifications.service.js')

/**
 * Orchestrates the process of fetching and updating the status of 'notification' from the Notify service.
 *
 * This function retrieves a list of 'notifications' and iterates over them to update their status
 * according to the latest information from Notify.
 *
 * The updates are done in batches to comply with rate-limiting constraints imposed by the Notify service.
 * The rate limit is set to 3,000 messages per minute, which the service respects during processing.
 *
 * If the number of 'notifications' exceeds the internal batch size limit, the notifications are split into
 * smaller batches for processing. This ensures efficient processing while adhering to the rate limit.
 *
 * After all notifications are updated, any notifications with an event that has failed (Notify error, not a 4xx or 5xx
 * error) will trigger an update to the error count for the corresponding event.
 *
 */
async function go() {
  const { batchSize, delay } = NotifyConfig

  const notifications = await FetchNotificationsService.go()

  for (let i = 0; i < notifications.length; i += batchSize) {
    const batchNotifications = notifications.slice(i, i + batchSize)

    const updatedNotifications = await _batch(batchNotifications)

    await UpdateAbstractionAlertsService.go(updatedNotifications)

    await _delay(delay)
  }

  await _updateEventErrorCount(notifications)
}

async function _batch(notifications) {
  const toUpdateNotifications = _toUpdateNotifications(notifications)

  const updatedNotifications = await _updateNotifications(toUpdateNotifications)

  await UpdateNotificationsService.go(updatedNotifications)

  return toUpdateNotifications
}

async function _delay(delay) {
  return setTimeout(delay)
}

async function _notificationStatus(notification) {
  const notifyResponse = await NotifyStatusRequest.send(notification.notifyId)

  if (notifyResponse.errors) {
    return notification
  } else {
    const notifyStatus = NotifyStatusPresenter.go(notifyResponse.status, notification)

    return {
      ...notification,
      ...notifyStatus
    }
  }
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
