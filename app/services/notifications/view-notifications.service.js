'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view notifications page
 * @module ViewNotificationsService
 */

const FetchNotificationsService = require('../notifications/fetch-notifications.service.js')
const ViewNotificationsPresenter = require('../../presenters/notifications/view-notifications.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view notifications page
 *
 * @param {string} notificationId - The UUID of the notifications to view
 * @param {string} licenceId - The UUID of the licence that relates to the notification
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view notifications template.
 */
async function go(notificationId, licenceId) {
  const notificationData = await FetchNotificationsService.go(notificationId, licenceId)

  const pageData = ViewNotificationsPresenter.go(notificationData)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
