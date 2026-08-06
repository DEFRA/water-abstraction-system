/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/communications` page
 *
 * @module ViewCommunicationsService
 */

import PaginatorPresenter from 'water-abstraction-engine/presenters/paginator.presenter.js'

import CommunicationsPresenter from '../../../presenters/users/internal/communications.presenter.js'
import FetchNotificationsDal from '../../../dal/users/internal/fetch-notifications.dal.js'
import FetchUserDal from '../../../dal/users/fetch-user.dal.js'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/communications` page
 *
 * @param {string} id - the UUID of the user
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewCommunicationsService(id, page) {
  const user = await FetchUserDal(id)

  const { notifications, totalNumber } = await FetchNotificationsDal(user.username, page)

  const pageData = CommunicationsPresenter(user, notifications)

  const pagination = PaginatorPresenter(
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
