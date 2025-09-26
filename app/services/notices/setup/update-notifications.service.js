'use strict'

/**
 * Update notifications
 * @module UpdateNotificationsService
 */

const NotificationModel = require('../../../../app/models/notification.model.js')

/**
 * Update notifications
 *
 * Our batch send process retrieves the notifications to be sent, then in batches of 125 sends them to Notify. The
 * result for each is formatted in the 'NotifyUpdatePresenter' then applied to the notification object. When the batch
 * is done the notifications are then passed to this service to record the results.
 *
 * Though we are using an INSERT query, no new records will be inserted. INSERT with ONCONFLICT and MERGE becomes an
 * UPSERT query, which means we can batch update the notifications instead of processing them individually.
 *
 * > There is a
 * > {$link https://www.postgresql.org/docs/current/postgres-fdw.html#POSTGRES-FDW-OPTIONS-REMOTE-EXECUTION |limitation}
 * > on the batch size. However, we should never hit it, as we process notifications in batches of 125.
 *
 * @param {object[]} updatedNotifications - the notifications updated with their Notify sending result to be updated
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
