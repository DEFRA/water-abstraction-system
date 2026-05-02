'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/return-logs/{id}/communications' page
 *
 * @module ViewCommunicationsService
 */

const CommunicationsPresenter = require('../../../presenters/users/internal/communications.presenter.js')
const FetchNotificationsDal = require('../../../dal/users/internal/fetch-notifications.dal.js')
const FetchUserService = require('../fetch-user.service.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/users/internal/{id}/communications' page
 *
 * @param {string} id - the UUID of the user
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, page) {
  const user = await FetchUserService.go(id)

  const { notifications, totalNumber } = await FetchNotificationsDal.go(user.username, page)

  const pageData = CommunicationsPresenter.go(user, notifications)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/users/internal/${id}/communications`,
    notifications.length,
    'communications'
  )

  return {
    activeNavBar: 'users',
    activeSecondaryNav: 'communications',
    pagination,
    ...pageData
  }
}

module.exports = {
  go
}
