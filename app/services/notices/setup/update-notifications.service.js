'use strict'

/**
 * Update notifications
 * @module UpdateNotificationsService
 */

const NotificationModel = require('../../../../app/models/notification.model.js')

/**
 * Update notifications
 *
 * This query uses postgresql's ability to insert/ upsert with batches. There is a limitation on the batch size
 * https://www.postgresql.org/docs/current/postgres-fdw.html#POSTGRES-FDW-OPTIONS-REMOTE-EXECUTION. The calling
 * service will handle the batch process.
 *
 * This query updates notifications with the response from Notify. This is formatted in the 'NotifyUpdatePresenter'.
 *
 * @param {object} notifications
 *
 * @returns {object} - the updated notifications
 */
async function go(notifications) {
  return NotificationModel.query()
    .insert(notifications)
    .onConflict('id')
    .merge(['notifyError', 'notifyId', 'notifyStatus', 'plaintext', 'status'])
}

module.exports = {
  go
}
