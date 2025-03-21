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
 * @param {string} id - The ID of the notifications to view
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view notifications template.
 */
async function go(id) {
  const communication = await FetchNotificationsService.go(id)

  const pageData = ViewNotificationsPresenter.go(communication)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
