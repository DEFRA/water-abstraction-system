/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/details` page
 * @module ViewDetailsService
 */

import FetchUserDetailsDal from '../../../dal/users/internal/fetch-user-details.dal.js'
import DetailsPresenter from '../../../presenters/users/internal/details.presenter.js'

/**
 * Orchestrates fetching and presenting internal user data for `/users/internal/{id}/details` page
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} id - The user's ID
 *
 * @returns {Promise<object>} The view data for the internal user details page
 */
export default async function go(auth, id) {
  const internalUser = await FetchUserDetailsDal(id)
  const pageData = DetailsPresenter.go(auth, internalUser)

  return {
    activeNavBar: 'users',
    activeSecondaryNav: 'details',
    ...pageData
  }
}
