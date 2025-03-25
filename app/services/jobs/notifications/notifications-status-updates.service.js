'use strict'

/**
 * Updates the statuses of notifications
 * @module ProcessNotificationsStatusUpdatesService
 */

const FetchService = require('./fetch-event-notifications.service.js')
const NotifyStatusPresenter = require('../../../presenters/notifications/setup/notify-status.presenter.js')
const NotifyStatusService = require('../../notify/notify-status.service.js')
const UpdateNotificationsService = require('../../notifications/setup/update-notifications.service.js')

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

  // we can batch this here
  for (const scheduledNotification of event.scheduledNotifications) {
    const notifyResponse = await NotifyStatusService.go(scheduledNotification.notifyId)
    const notifyStatus = NotifyStatusPresenter.go(notifyResponse.status, scheduledNotification)

    // use status top be explicit - notifyResponse
    if (notifyStatus.status) {
      notifications.push({
        ...notifyStatus,
        id: scheduledNotification.id
      })
    }
  }

  await UpdateNotificationsService.go(notifications)
}

module.exports = {
  go
}
