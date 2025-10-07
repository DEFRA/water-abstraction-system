'use strict'

/**
 * Processes a returned letter callback from GOV.UK Notify
 *
 * @module SubmitReturnedLetterService
 */

const NotificationModel = require('../../models/notification.model.js')

/**
 * Processes a returned letter callback from GOV.UK Notify
 *
 * When a letter sent by Notify is 'returned to sender', they can let us know via a callback request.
 *
 * The request from Notify will contain the Notify ID of the notification. We can use that to identify the relevant
 * notification that has been returned, and update it accordingly.
 *
 * @param {string} notifyId - Notify's ID for the notification
 *
 * @returns {Promise<object>} - The returned database object
 */
async function go(notifyId) {
  const notification = await NotificationModel.query()
    .patch({ returnedAt: new Date(), status: 'returned' })
    .where('notifyId', notifyId)
    .returning('id')

  if (notification.length === 0) {
    global.GlobalNotifier.omg('No matching notice found for returned letter request', { notifyId })
  }
}

module.exports = {
  go
}
