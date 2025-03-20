'use strict'

/**
 * Update notifications
 * @module UpdateNotificationsService
 */

const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')

/**
 * Update notifications
 *
 * This query uses postgresql's ability to insert with batches. There is a limitation on the batch size
 * https://www.postgresql.org/docs/current/postgres-fdw.html#POSTGRES-FDW-OPTIONS-REMOTE-EXECUTION. The calling
 * service will handle the batch process.
 *
 * @param {object} notifications
 *
 * @returns {object} - the Updated notifications
 */
async function go(notifications) {
  return ScheduledNotificationModel.query().insert(notifications).onConflict('id').merge(['status', 'notifyStatus'])
}

module.exports = {
  go
}
