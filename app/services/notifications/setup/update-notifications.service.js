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
 * We have used an insert with onConflict to allow us to provide an array of notifications to reduce the calls needed to
 * the database.
 *
 * ```javascript
 * [
 *   {
 *     notifyId: '1234',
 *     notifyStatus: 'received',
 *     status: 'sent'
 *   },
 *   {
 *     notifyId: '123',
 *     status: 'sent'
 *   }
 * ]
 * ```
 *
 * @param {object} notifications
 *
 * @returns {object} - the Updated notifications
 */
async function go(notifications) {
  return ScheduledNotificationModel.query()
    .insert(notifications)
    .onConflict('notifyId')
    .merge(['status', 'notifyStatus'])
}

module.exports = {
  go
}
