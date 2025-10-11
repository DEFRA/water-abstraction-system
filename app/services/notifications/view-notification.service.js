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
 * @param {string} notificationId - The UUID of the notifications to view
 * @param {string} licenceId - The UUID of the licence that relates to the notification
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view notification template.
 */
async function go(notificationId, licenceId) {
  const { licence, notification } = await FetchNotificationService.go(notificationId, licenceId)

  const pageData = ViewNotificationPresenter.go(licence, notification)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
