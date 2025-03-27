'use strict'

/**
 * Orchestrates the process of fetching and updating the status of 'scheduledNotification' from the Notify service.
 * @module ProcessNotificationsStatusUpdatesService
 */

const FetchEventNotificationsService = require('./fetch-event-notifications.service.js')
const NotifyStatusPresenter = require('../../../presenters/notifications/setup/notify-status.presenter.js')
const NotifyStatusService = require('../../notify/notify-status.service.js')
const UpdateNotificationsService = require('../../notifications/setup/update-notifications.service.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Orchestrates the process of fetching and updating the status of 'scheduledNotification' from the Notify service.
 *
 * This function iterates over a list of 'events' that require their associated 'scheduledNotifications' to have
 * their status checked and updated based on the latest information from Notify.
 *
 * Each 'scheduledNotification' status will be updated individually, adhering to the rate-limiting constraints imposed
 * by the 'BatchNotificationsService' provided by Notify. The rate limit is 3,000 messages per minute.
 *
 * If the number of 'scheduledNotifications' associated with an event exceeds the internal batch size limit, the
 * notifications will be split into smaller batches for processing. This ensures that the service respects the rate
 * limit while processing a large number of notifications.
 *
 */
async function go() {
  const events = await FetchEventNotificationsService.go()

  for (const event of events) {
    await _processEvent(event)
  }
}

async function _notificationStatus(scheduledNotification, notifications) {
  const notifyResponse = await NotifyStatusService.go(scheduledNotification.notifyId)

  if (!notifyResponse.errors) {
    const notifyStatus = NotifyStatusPresenter.go(notifyResponse.status, scheduledNotification)

    notifications.push({
      ...notifyStatus,
      id: scheduledNotification.id,
      createdAt: timestampForPostgres()
    })
  }
}

async function _processEvent(event) {
  const notifications = []

  for (const scheduledNotification of event.scheduledNotifications) {
    await _notificationStatus(scheduledNotification, notifications)
  }

  if (notifications.length > 0) {
    await UpdateNotificationsService.go(notifications)
  }
}

module.exports = {
  go
}
