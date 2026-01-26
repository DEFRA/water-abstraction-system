'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view return log page
 * @module ViewReturnLogService
 */

const FetchReturnLogNotificationsService = require('./fetch-return-log-notifications.service.js')
const FetchReturnLogService = require('./fetch-return-log.service.js')
const ViewReturnLogPresenter = require('../../presenters/return-logs/view-return-log.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view return log page
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} returnLogId - The UUID of the return log to view
 * @param {number} version - The version number of the associated return submission to view (0 means 'current')
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the view return log template.
 */
async function go(auth, returnLogId, version) {
  const returnLog = await FetchReturnLogService.go(returnLogId, version)
  const notifications = await FetchReturnLogNotificationsService.go(returnLogId)

  const pageData = ViewReturnLogPresenter.go(auth, returnLog, notifications)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
