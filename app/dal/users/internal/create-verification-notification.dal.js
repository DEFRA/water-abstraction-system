'use strict'

/**
 * Creates a verification notification record for the new user
 * @module CreateVerificationNotificationDal
 */

const NotificationModel = require('../../../models/notification.model.js')

const { domains } = require('../../../../config/server.config.js')

/**
 * Creates a verification notification record for the new user
 *
 * @param {string} email - The email address of the new user
 * @param {string} resetGuid - The reset GUID for the new user
 *
 * @returns {Promise<object>} The created notification
 */
async function go(email, resetGuid) {
  const personalisation = {
    unique_create_password_link: `${domains.internal}/reset_password_change_password?resetGuid=${resetGuid}`
  }

  const notificationData = {
    messageRef: 'new_internal_user_email',
    messageType: 'email',
    personalisation,
    recipient: email
  }

  return NotificationModel.query().insert(notificationData)
}

module.exports = {
  go
}
