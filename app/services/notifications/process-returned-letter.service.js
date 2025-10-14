'use strict'

/**
 * Processes a returned letter callback from GOV.UK Notify
 *
 * @module ProcessReturnedLetterService
 */

const NotificationModel = require('../../models/notification.model.js')
const UpdateEventService = require('../jobs/notification-status/update-event.service.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds, timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Processes a returned letter callback from GOV.UK Notify
 *
 * When a letter sent by Notify is 'returned to sender', they can let us know via a callback request.
 *
 * The request from Notify will contain the Notify ID of the notification. We can use that to identify the relevant
 * notification that has been returned, and update it accordingly.
 *
 * @param {string} payload - Payload from the Notify callback
 */
async function go(payload) {
  try {
    const startTime = currentTimeInNanoseconds()

    const { notification_id: notifyId } = payload

    const updatedNotifications = await NotificationModel.query()
      .patch({ returnedAt: timestampForPostgres(), status: 'returned' })
      .where('notifyId', notifyId)
      .returning(['eventId', 'id'])

    if (updatedNotifications.length) {
      // Recalculate the overall status and status counts on the linked notice.
      await UpdateEventService.go([updatedNotifications[0].eventId])
    }

    calculateAndLogTimeTaken(startTime, 'Returned letter complete', {
      payload,
      notification: { ...updatedNotifications[0] }
    })
  } catch (error) {
    global.GlobalNotifier.omfg('Returned letter failed', payload, error)
  }
}

module.exports = {
  go
}
