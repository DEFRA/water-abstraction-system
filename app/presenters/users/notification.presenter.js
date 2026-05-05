'use strict'

/**
 * Formats notification data ready for presenting in the view user notification page
 * @module ViewNotificationPresenter
 */

const NotificationErrorPresenter = require('../notifications/notification-error.presenter.js')
const { formatLongDate } = require('../base.presenter.js')
const { userNotificationTypes } = require('../../lib/static-lookups.lib.js')

/**
 * Formats notification data ready for presenting in the view user notification page
 *
 * User notifications are not linked to a notice, so we only have the information in the notification to pull from.
 *
 * Also, though we do send some letters to users, there is no link between the user and the letter notification sent.
 *
 * Therefore, this presenter can assume it is only handling email notifications, and we don't have information such as
 * who sent the notification.
 *
 * @param {module:NotificationModel} notification - The selected notification with attached notice
 * @param {module:UserModel} user - The related user
 * @param {string} type - Whether the user is internal or external
 * @param {boolean} superUser - Whether the user viewing the notification is a super user
 *
 * @returns {object} The data formatted for the view template
 */
function go(notification, user, type, superUser) {
  const { createdAt, messageRef, messageType, recipient } = notification

  return {
    backLink: _backLink(user, type),
    contents: _contents(notification, superUser),
    errorDetails: NotificationErrorPresenter.go(notification),
    messageType,
    pageTitle: userNotificationTypes[messageRef].label,
    pageTitleCaption: user.username,
    sentDate: formatLongDate(createdAt),
    sentTo: recipient,
    status: notification.status
  }
}

function _backLink(user, type) {
  return { href: `/system/users/${type}/${user.id}/communications`, text: 'Go back to user' }
}

function _contents(notification, superUser) {
  const { messageRef, plaintext } = notification

  if (!plaintext) {
    return null
  }

  const protectedContent = userNotificationTypes[messageRef].protected

  if (protectedContent && !superUser) {
    return '## This content is protected.'
  }

  return plaintext
}

module.exports = {
  go
}
