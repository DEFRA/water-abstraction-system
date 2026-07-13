/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/details` page
 * @module ViewDetailsService
 */

import FetchUserDetailsDal from '../../../dal/users/external/fetch-user-details.dal.js'
import DetailsPresenter from '../../../presenters/users/external/details.presenter.js'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/details` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {Promise<object>} The view data for the external user page
 */
export default async function (id, auth, back = 'users') {
  const user = await FetchUserDetailsDal(id)

  const pageData = DetailsPresenter(user, auth.credentials.scope, back)

  return {
    activeSecondaryNav: 'details',
    ...pageData
  }
}
