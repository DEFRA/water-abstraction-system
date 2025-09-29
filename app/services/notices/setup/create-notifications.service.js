'use strict'

/**
 * Create notifications
 * @module CreateNotificationsService
 */

const NotificationModel = require('../../../../app/models/notification.model.js')

/**
 * Create notifications
 *
 * This query uses postgresql's ability to insert with batches. There is a limitation on the batch size
 * https://www.postgresql.org/docs/current/postgres-fdw.html#POSTGRES-FDW-OPTIONS-REMOTE-EXECUTION. The calling
 * service will handle the batch process.
 *
 * > By using the batch insert, we need the upstream service to set the 'createdAt' field.
 *
 * @param {object} notifications
 *
 * @returns {Promise<object>} - the created notifications
 */
async function go(notifications) {
  return NotificationModel.query().insert(notifications)
}

module.exports = {
  go
}
