'use strict'

/**
 * Orchestrates the process of fetching and updating the status of 'scheduledNotification' from the Notify service.
 * @module ProcessNotificationsStatusUpdatesService
 */

const { setTimeout } = require('node:timers/promises')

const FetchScheduledNotificationsService = require('./fetch-scheduled-notifications.service.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const NotifyStatusPresenter = require('../../../presenters/notifications/setup/notify-status.presenter.js')
const NotifyStatusService = require('../../notify/notify-status.service.js')
const UpdateNotificationsService = require('../../notifications/setup/update-notifications.service.js')

/**
 * Orchestrates the process of fetching and updating the status of 'scheduledNotification' from the Notify service.
 *
 * This function retrieves a list of 'scheduledNotifications' and iterates over them to update their status
 * according to the latest information from Notify.
 *
 * The updates are done in batches to comply with rate-limiting constraints imposed by the Notify service.
 * The rate limit is set to 3,000 messages per minute, which the service respects during processing.
 *
 * If the number of 'scheduledNotifications' exceeds the internal batch size limit, the notifications are split into
 * smaller batches for processing. This ensures efficient processing while adhering to the rate limit.
 *
 * After all notifications are updated, any notifications with an event that has failed (Notify error, not a 4xx or 5xx
 * error) will trigger an update to the error count for the corresponding event.
 *
 */
async function go() {
  const { batchSize, delay } = NotifyConfig

  const scheduledNotifications = await FetchScheduledNotificationsService.go()

  for (let i = 0; i < scheduledNotifications.length; i += batchSize) {
    const batchScheduledNotifications = scheduledNotifications.slice(i, i + batchSize)

    await _batch(batchScheduledNotifications)

    await _delay(delay)
  }
}

async function _batch(scheduledNotifications) {
  const toUpdateNotifications = _toUpdateNotifications(scheduledNotifications)

  const updatedNotifications = await _updateNotifications(toUpdateNotifications)

  await UpdateNotificationsService.go(updatedNotifications)
}

async function _delay(delay) {
  return setTimeout(delay)
}

async function _notificationStatus(scheduledNotification) {
  const notifyResponse = await NotifyStatusService.go(scheduledNotification.notifyId)

  if (notifyResponse.errors) {
    return scheduledNotification
  } else {
    const notifyStatus = NotifyStatusPresenter.go(notifyResponse.status, scheduledNotification)

    return {
      ...scheduledNotification,
      ...notifyStatus
    }
  }
}

async function _updateNotifications(toSendNotifications) {
  const settledPromises = await Promise.allSettled(toSendNotifications)

  return settledPromises.map((settledPromise) => settledPromise.value)
}

function _toUpdateNotifications(scheduledNotifications) {
  const updateNotifications = []

  for (const scheduledNotification of scheduledNotifications) {
    updateNotifications.push(_notificationStatus(scheduledNotification))
  }

  return updateNotifications
}

module.exports = {
  go
}
