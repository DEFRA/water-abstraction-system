'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view notification page
 * @module ViewNotificationService
 */

const FetchNotificationService = require('./fetch-notification.service.js')
const ViewNotificationPresenter = require('../../presenters/notifications/view-notification.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view notification page
 *
 * If linked to from the view licence communications page, the ID of the licence will be included in the link and the
 * page will display the notification from within that context, for example, `pageTitleCaption` will be the licence ref.
 *
 * If no licence ID is provided then it is assumed we are linked from the view notice page. Now the page will display
 * the notice reference in `pageTitleCaption` instead of in the metadata.
 *
 * @param {string} notificationId - The UUID of the notifications to view
 * @param {string} [licenceId=null] - If coming from the licence communications page, the UUID of the licence that
 * relates to the notification
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view notification template.
 */
async function go(notificationId, licenceId = null) {
  const { licence, notification } = await FetchNotificationService.go(notificationId, licenceId)

  return ViewNotificationPresenter.go(notification, licence)
}

module.exports = {
  go
}
