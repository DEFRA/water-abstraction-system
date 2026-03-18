'use strict'

/**
 * Fetches data needed to determine if an email address has been used to send notifications.
 * @module FetchNotificationService
 */

const NotificationModel = require('../../../models/notification.model.js')
const { ignoreMessageRef } = require('../../../lib/static-lookups.lib.js')

/**
 * Fetches data needed to determine if an email address has been used to send notifications.
 *
 * We only need to fetch the first notification, as we are only interested in whether the email address has been used to
 * send notifications. We do not need to know anything about the notification, just the email has been used.
 *
 * @param {string} email - The email of the company contact id
 *
 * @returns {Promise<module:NotificationModel>} a notification, or undefined if the email address has not been used to
 * send notifications
 */
async function go(email) {
  return _fetch(email)
}

async function _fetch(email) {
  return NotificationModel.query()
    .select(['id'])
    .where('recipient', email)
    .whereNotIn('messageRef', ignoreMessageRef)
    .limit(1)
    .first()
}

module.exports = {
  go
}
