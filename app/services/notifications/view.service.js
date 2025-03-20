'use strict'

/**
 * Orchestrates presenting the data for `/notifications` page
 * @module ViewNotificationsService
 */

const FetchScheduledNotificationsService = require('./fetch-events-notifications.service.js')
const ViewNotificationsPresenter = require('../../presenters/notifications/view.presenter.js')

/**
 * Orchestrates presenting the data for `/notifications` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The view data for the notifications page
 */
async function go(yar) {
  const filters = await _getFilters(yar)

  const data = await FetchScheduledNotificationsService.go(filters)
  const formattedData = ViewNotificationsPresenter.go(data, filters)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

async function _getFilters(yar) {
  const filters = yar.get('notifications-filter')
  const filterNotificationTypes = filters?.filterNotificationTypes
  const sentBy = filters?.sentBy
  const sentFromDay = filters?.sentFromDay
  const sentFromMonth = filters?.sentFromMonth
  const sentFromYear = filters?.sentFromYear
  const sentToDay = filters?.sentToDay
  const sentToMonth = filters?.sentToMonth
  const sentToYear = filters?.sentToYear

  return {
    filterNotificationTypes,
    sentBy,
    sentFromDay,
    sentFromMonth,
    sentFromYear,
    sentToDay,
    sentToMonth,
    sentToYear
  }
}

module.exports = {
  go
}
