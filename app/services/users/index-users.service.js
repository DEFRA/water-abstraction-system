/**
 * Orchestrates presenting the data for `/users` page
 * @module IndexUsersService
 */

import FetchUsersDal from '../../dal/users/fetch-users.dal.js'
import IndexUsersPresenter from '../../presenters/users/index-users.presenter.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { readFlashNotification } from '../../lib/general.lib.js'
import { processSavedFilters } from '../../lib/submit-page.lib.js'

import featureFlagsConfig from '../../../config/feature-flags.config.js'

/**
 * Orchestrates presenting the data for `/users` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the users page
 */
export default async function go(yar, auth, page) {
  const filters = _filters(yar)

  const { results: users, total: totalNumber } = await FetchUsersDal(filters, page)

  const pagination = PaginatorPresenter(totalNumber, page, `/system/users`, users.length, 'users')

  const pageData = IndexUsersPresenter(users, auth)

  const notification = readFlashNotification(yar)

  return {
    activeNavBar: featureFlagsConfig.enableUsersView ? 'users' : 'search',
    filters,
    notification,
    pagination,
    ...pageData
  }
}

function _filters(yar) {
  const savedFilters = processSavedFilters(yar, 'usersFilter')

  return {
    email: null,
    permissions: null,
    status: null,
    type: null,
    ...savedFilters
  }
}
