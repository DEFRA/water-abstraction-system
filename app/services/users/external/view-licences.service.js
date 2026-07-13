/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/licences` page
 * @module ViewLicencesService
 */

import FetchLicencesDal from '../../../dal/users/external/fetch-licences.dal.js'
import FetchUserDal from '../../../dal/users/fetch-user.dal.js'
import LicencesPresenter from '../../../presenters/users/external/licences.presenter.js'
import PaginatorPresenter from '../../../presenters/paginator.presenter.js'
import { readFlashNotification } from '../../../lib/general.lib.js'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/licences` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {Promise<object>} The view data for the external user page
 */
export default async function viewLicences(id, auth, page, yar, back = 'users') {
  const user = await FetchUserDal(id)

  const { licences, totalNumber } = await FetchLicencesDal(user.licenceEntityId, page)

  const pageData = LicencesPresenter(user, licences, auth.credentials.scope, back)

  const pagination = PaginatorPresenter(
    totalNumber,
    page,
    `/system/users/external/${id}/licences`,
    licences.length,
    'licences',
    { back }
  )

  const notification = readFlashNotification(yar)

  return {
    activeSecondaryNav: 'licences',
    pagination,
    notification,
    ...pageData
  }
}
