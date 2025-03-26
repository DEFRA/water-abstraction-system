'use strict'

/**
 * Updates the statuses of notifications
 * @module ProcessNotificationsStatusUpdatesService
 */

const FetchService = require('./fetch-event-notifications.service.js')
const NotifyStatusPresenter = require('../../../presenters/notifications/setup/notify-status.presenter.js')
const NotifyStatusService = require('../../notify/notify-status.service.js')
const UpdateNotificationsService = require('../../notifications/setup/update-notifications.service.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Updates the statuses of notifications
 */
async function go() {
  const events = await FetchService.go()

  for (const event of events) {
    await _processEvent(event)
  }
}

async function _processEvent(event) {
  const notifications = []

  for (const scheduledNotification of event.scheduledNotifications) {
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

  if (notifications.length > 0) {
    await UpdateNotificationsService.go(notifications)
  }
}

module.exports = {
  go
}
