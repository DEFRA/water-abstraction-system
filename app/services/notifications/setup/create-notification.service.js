'use strict'

/**
 * Create a notification
 * @module CreateNotificationService
 */

const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')

/**
 * Create a notification
 *
 * @param {object} notifications
 *
 * @returns {object} - the created notifications
 */
async function go(notifications) {
  return _createNotification(notifications)
}

/**
 * This query uses postgresql's ability to insert with batches. There is a limitation on the batch size
 * https://www.postgresql.org/docs/current/postgres-fdw.html#POSTGRES-FDW-OPTIONS-REMOTE-EXECUTION. We do not anticipate
 * we will hit this limit.
 *
 * By using the batch insert we need the upstream service to set the 'createdAt' field.
 *
 * @private
 */
async function _createNotification(notifications) {
  return ScheduledNotificationModel.query().insert(notifications)
}

module.exports = {
  go
}
