/**
 * Orchestrates fetching and presenting the data for the '/return-logs/{id}/communications' page
 *
 * @module ViewCommunicationsService
 */

import CommunicationsPresenter from '../../presenters/return-logs/communications.presenter.js'
import FetchNotificationsDal from '../../dal/return-logs/fetch-notifications.dal.js'
import FetchReturnLogService from './fetch-return-log.service.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'

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

  const { notifications, totalNumber } = await FetchNotificationsDal.go(id, page)

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

export default {
  go
}
