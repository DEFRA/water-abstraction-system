/**
 * Formats notifications data for display in communications tables on view external and internal user pages
 * @module NotificationsTablePresenter
 */

import { formatLongDate, sentenceCase } from '../base.presenter.js'
import { userNotificationTypes } from '../../lib/static-lookups.lib.js'

/**
 * Formats data for display in communications tables on view external and internal user pages
 *
 * @param {module:NotificationModel[]} notifications - All notifications linked to the user
 * @param {string} userId - The id of the user to go back to from the notification details page
 * @param {string} type - The type of user ('internal' or 'external')
 *
 * @returns {object} The data formatted for the view template
 */
export default function (notifications, userId, type) {
  return notifications.map((notification) => {
    const { createdAt, messageType, status } = notification
    const sentDate = formatLongDate(createdAt)

    return {
      link: _link(notification, sentDate, userId, type),
      method: sentenceCase(messageType),
      sentDate,
      status
    }
  })
}

function _link(notification, sentDate, userId, type) {
  const { id: notificationId, messageRef, messageType } = notification

  const hiddenText = `sent ${sentDate} via ${messageType}`

  return {
    hiddenText,
    href: `/system/users/${type}/${userId}/notifications/${notificationId}`,
    text: userNotificationTypes[messageRef].label
  }
}
