'use strict'

/**
 * Formats notifications data for display in communications tables on view licence communications and return log pages
 * @module NotificationsTablePresenter
 */

const { formatLongDate, formatNoticeType, sentenceCase } = require('../base.presenter.js')

/**
 * Formats data for display in communications tables on view licence communications and return log pages
 *
 * @param {module:NotificationModel[]} notifications - All notifications linked to the licence
 * @param {string} licenceId - The id of the licence to return to if provided
 * @param {string} returnId - The id of the return log to return to if provided
 *
 * @returns {object} The data formatted for the view template
 */
function go(notifications, licenceId, returnId) {
  return notifications.map((notification) => {
    const { createdAt, event, messageType, status } = notification
    const sentDate = formatLongDate(createdAt)

    return {
      link: _link(notification, licenceId, sentDate, returnId),
      method: sentenceCase(messageType),
      sentBy: event.issuer,
      sentDate,
      status,
      type: formatNoticeType(event.subtype, event.sendingAlertType)
    }
  })
}

function _link(notification, licenceId, sentDate, returnId) {
  const { id: notificationId, messageType } = notification

  const hiddenText = `sent ${sentDate} via ${messageType}`

  let href = `/system/notifications/${notificationId}`

  if (licenceId) {
    href += `?id=${licenceId}`
  } else if (returnId) {
    href += `?return=${returnId}`
  }

  return {
    hiddenText,
    href
  }
}

module.exports = {
  go
}
