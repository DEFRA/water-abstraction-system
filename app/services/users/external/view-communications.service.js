/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/communications` page
 *
 * @module ViewCommunicationsService
 */

import CommunicationsPresenter from '../../../presenters/users/external/communications.presenter.js'
import FetchNotificationsDal from '../../../dal/users/external/fetch-notifications.dal.js'
import FetchUserDal from '../../../dal/users/fetch-user.dal.js'
import PaginatorPresenter from '../../../presenters/paginator.presenter.js'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/communications` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function (id, auth, page, back = 'users') {
  const user = await FetchUserDal(id)

  const { notifications, totalNumber } = await FetchNotificationsDal(user.username, page)

  const pageData = CommunicationsPresenter(user, notifications, auth.credentials.scope, back)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/users/external/${id}/communications`,
    notifications.length,
    'communications',
    { back }
  )

  return {
    activeSecondaryNav: 'communications',
    pagination,
    ...pageData
  }
}
