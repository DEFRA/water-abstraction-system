'use strict'

/**
 * Orchestrates updating the returnedAt date for a letter
 *
 * @module SubmitReturnedLetterService
 */

const NotificationModel = require('../../models/notification.model.js')

/**
 * Orchestrates updating the returnedAt date for a letter
 *
 * @param {string} notifyId - The id of the notification
 *
 * @returns {Promise<object>} - The returned database object
 */
async function go(notifyId) {
  await NotificationModel.query().patch({ returnedAt: new Date() }).where('notifyId', notifyId)
}

module.exports = {
  go
}
