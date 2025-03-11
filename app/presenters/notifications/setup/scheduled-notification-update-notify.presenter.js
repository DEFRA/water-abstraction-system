'use strict'

/**
 * Updates a scheduled notification to use the notify response data
 * @module ScheduledNotificationsUpdateNotifyPresenter
 */

const CREATED = 201

/**
 * Updates a scheduled notification to use the notify response data
 *
 * A scheduled notification is created before the request to notify. When the request is made to notify we need to
 * capture the response. When the request is successful we need to store the notify id to make future check on its
 * status. When a request fails we will not receive a notify id and will need to store the error in the same pattern as
 * the legacy code.
 *
 * @param {object} scheduledNotification
 * @param {object } notify - the response from notify
 *
 * @returns {object} - a scheduled notification updated with the notify response
 */
function go(scheduledNotification, notify) {
  if (notify.status !== CREATED) {
    return {
      ...scheduledNotification,
      ..._error(notify)
    }
  }

  return {
    ...scheduledNotification,
    notifyId: notify.id,
    notifyStatus: notify.statusText,
    plaintext: notify.plaintext,
    status: 'sent'
  }
}

function _error(notify) {
  return {
    log: JSON.stringify(notify),
    status: 'error'
  }
}

module.exports = {
  go
}
