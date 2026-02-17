'use strict'

/**
 * Fetches data needed for the view '/system/company-contacts/{id}/check' page
 * @module FetchNotificationsService
 */

const NotificationModel = require('../../../models/notification.model.js')

/**
 * Fetches data needed for the view '/system/company-contacts/{id}/check' page
 *
 * @param {string} email - The email of the company contact id
 *
 * @returns {Promise<object>} the data needed to populate the view company contacts communications
 */
async function go(email) {
  return _fetch(email)
}

async function _fetch(email) {
  return NotificationModel.query()
    .select(['id'])
    .where('recipient', email)
    .whereNotIn('messageRef', [
      'email_change_email_in_use_email',
      'email_change_verification_code_email',
      'existing_user_verification_email',
      'expiry_notification_email',
      'fake!',
      'new_internal_user_email',
      'new_user_verification_email',
      'password_locked_email',
      'password_reset_email',
      'security_code_letter',
      'share_existing_user',
      'share_new_user'
    ])
    .first()
}

module.exports = {
  go
}
