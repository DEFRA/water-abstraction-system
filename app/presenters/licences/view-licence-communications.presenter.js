'use strict'

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 * @module ViewLicenceCommunicationsPresenter
 */

const { formatLongDate, formatNoticeType, sentenceCase } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/communications` view licence communications page
 *
 * @param {module:NotificationModel[]} notifications - All notifications linked to the licence
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {object} The data formatted for the view template
 */
function go(notifications, licenceId) {
  return {
    notifications: _notifications(notifications, licenceId)
  }
}

function _link(notification, licenceId, sentDate) {
  const { id: notificationId, messageType } = notification

  return {
    hiddenText: `sent ${sentDate} via ${messageType}`,
    href: `/system/notifications/${notificationId}?id=${licenceId}`
  }
}

function _notifications(notifications, licenceId) {
  return notifications.map((notification) => {
    const { createdAt, event, messageType, status } = notification
    const sentDate = formatLongDate(createdAt)

    return {
      link: _link(notification, licenceId, sentDate),
      method: sentenceCase(messageType),
      sentBy: event.issuer,
      sentDate,
      status,
      type: formatNoticeType(event.subtype, event.sendingAlertType)
    }
  })
}

module.exports = {
  go
}
