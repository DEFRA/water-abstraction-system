'use strict'

/**
 * Formats the response from Notify
 * @module NotifyUpdatePresenter
 */

const CREATED = 201

/**
 * Formats the response from Notify
 *
 * When the request is made to notify we need to capture the response.
 *
 * When the request is successful we need to store the notify id to make future check on its status.
 *
 * When a request fails we will not receive a notify id and will need to store the error in the same pattern as the
 * legacy code.
 *
 * @param {object } notify - the response from notify
 *
 * @returns {object} - the Notify response formatted to save as part of a 'water.scheduled_notifications'
 */
function go(notify) {
  if (notify.status !== CREATED) {
    return _error(notify)
  }

  return {
    notifyId: notify.id,
    notifyStatus: notify.statusText,
    plaintext: notify.plaintext,
    status: 'pending'
  }
}

function _error(notify) {
  return {
    notifyError: JSON.stringify(notify),
    status: 'error'
  }
}

module.exports = {
  go
}
