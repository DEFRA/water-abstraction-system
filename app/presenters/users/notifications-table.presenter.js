'use strict'

/**
 * Formats notifications data for display in communications tables on view external and internal user pages
 * @module NotificationsTablePresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')

const USER_NOTIFICATION_TYPES = {
  email_change_email_in_use_email: 'Change email address - email already in use',
  email_change_verification_code_email: 'Change email address - verification code',
  existing_user_verification_email: 'Existing user verification',
  expiry_notification_email: 'Expiry notification',
  new_internal_user_email: 'New internal user',
  new_user_verification_email: 'New user verification',
  password_locked_email: 'Password locked',
  password_reset_email: 'Password reset',
  security_code_letter: 'Security code letter',
  share_existing_user: 'Share existing user',
  share_new_user: 'Share new user'
}

/**
 * Formats data for display in communications tables on view external and internal user pages
 *
 * @param {module:NotificationModel[]} notifications - All notifications linked to the user
 * @param {string} userId - The id of the user to go back to from the notification details page
 *
 * @returns {object} The data formatted for the view template
 */
function go(notifications, userId) {
  return notifications.map((notification) => {
    const { createdAt, messageType, status } = notification
    const sentDate = formatLongDate(createdAt)

    return {
      link: _link(notification, sentDate, userId),
      method: sentenceCase(messageType),
      sentDate,
      status
    }
  })
}

function _link(notification, sentDate, userId) {
  const { id: notificationId, messageRef, messageType } = notification

  const hiddenText = `sent ${sentDate} via ${messageType}`

  return {
    hiddenText,
    href: `/system/users/internal/${userId}/notifications/${notificationId}`,
    text: USER_NOTIFICATION_TYPES[messageRef]
  }
}

module.exports = {
  go
}
