/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/communications` page
 *
 * @module ViewCommunicationsService
 */

import CommunicationsPresenter from '../../../presenters/users/internal/communications.presenter.js'
import FetchNotificationsDal from '../../../dal/users/internal/fetch-notifications.dal.js'
import FetchUserDal from '../../../dal/users/fetch-user.dal.js'
import PaginatorPresenter from '../../../presenters/paginator.presenter.js'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/communications` page
 *
 * @param {string} id - the UUID of the user
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(id, page) {
  const user = await FetchUserDal(id)

  const { notifications, totalNumber } = await FetchNotificationsDal(user.username, page)

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

export {
  go
}
export default {
  go
}
