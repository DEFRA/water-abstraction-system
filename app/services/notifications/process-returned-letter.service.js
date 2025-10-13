'use strict'

/**
 * Processes a returned letter callback from GOV.UK Notify
 *
 * @module ProcessReturnedLetterService
 */

const NotificationModel = require('../../models/notification.model.js')
const UpdateEventService = require('../jobs/notification-status/update-event.service.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Processes a returned letter callback from GOV.UK Notify
 *
 * When a letter sent by Notify is 'returned to sender', they can let us know via a callback request.
 *
 * The request from Notify will contain the Notify ID of the notification. We can use that to identify the relevant
 * notification that has been returned, and update it accordingly.
 *
 * @param {string} notifyId - Notify's ID for the notification
 */
async function go(notifyId) {
  const updatedNotifications = await NotificationModel.query()
    .patch({ returnedAt: timestampForPostgres(), status: 'returned' })
    .where('notifyId', notifyId)
    .returning(['eventId', 'id'])

  if (updatedNotifications.length === 0) {
    global.GlobalNotifier.omg('No matching notification found for returned letter request', { notifyId })

    return
  }

  // Recalculate the overall status and status counts on the linked notice.
  await UpdateEventService.go([updatedNotifications[0].eventId])
}

module.exports = {
  go
}
