'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/return-logs/{id}/communications' page
 *
 * @module ViewCommunicationsService
 */

const CommunicationsPresenter = require('../../presenters/return-logs/communications.presenter.js')
const FetchNotificationsService = require('./fetch-notifications.service.js')
const FetchReturnLogService = require('./fetch-return-log.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/return-logs/{id}/communications' page
 *
 * @param {string} id - the UUID of the return log
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, page) {
  const returnLog = await FetchReturnLogService.go(id)

  const { notifications, totalNumber } = await FetchNotificationsService.go(id, page)

  const pageData = CommunicationsPresenter.go(returnLog, notifications)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/return-logs/${id}/communications`,
    notifications.length,
    'communications'
  )

  return {
    activeSecondaryNav: 'communications',
    pagination,
    ...pageData
  }
}

module.exports = {
  go
}
