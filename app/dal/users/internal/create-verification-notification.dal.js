/**
 * Creates a verification notification record for the new user
 * @module CreateVerificationNotificationDal
 */

import NotificationModel from '../../../models/notification.model.js'

import ServerConfig from '../../../../config/server.config.js'

/**
 * Creates a verification notification record for the new user
 *
 * @param {string} email - The email address of the new user
 * @param {string} resetGuid - The reset GUID for the new user
 *
 * @returns {Promise<object>} The created notification
 */
export default async function createVerificationNotificationDal(email, resetGuid) {
  const personalisation = {
    unique_create_password_link: `${ServerConfig.domains.internal}/reset_password_change_password?resetGuid=${resetGuid}`
  }

  const notificationData = {
    messageRef: 'new_internal_user_email',
    messageType: 'email',
    personalisation,
    recipient: email
  }

  return NotificationModel.query().insert(notificationData)
}
