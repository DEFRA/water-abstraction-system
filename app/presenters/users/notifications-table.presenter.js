'use strict'

/**
 * Formats notifications data for display in communications tables on view external and internal user pages
 * @module NotificationsTablePresenter
 */

const { formatLongDate, sentenceCase } = require('../base.presenter.js')
const { userNotificationTypes } = require('../../lib/static-lookups.lib.js')

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
    text: userNotificationTypes[messageRef].label
  }
}

module.exports = {
  go
}
