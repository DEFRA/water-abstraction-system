'use strict'

/**
 * Create a 'returnInvitation' or 'returnReminder' notification
 * @module CreateReturnsNotificationService
 */

const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Create a 'returnInvitation' or 'returnReminder' notification
 *
 * A notification for a 'returnInvitation' or 'returnReminder' should look like this:
 *
 * ```javascript
 *
 * ```
 *
 * @param {object} eventId
 *
 * @returns {object} - the created notification
 */
async function go(eventId) {
  return _createNotification(eventId)
}

async function _createNotification(eventId) {
  return ScheduledNotificationModel.query().insert({
    created_at: timestampForPostgres()
  })
}

module.exports = {
  go
}
