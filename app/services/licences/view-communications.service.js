/**
 * Orchestrates fetching and presenting the data needed for the view licence communications tab
 * @module ViewCommunicationsService
 */

import CommunicationsPresenter from '../../presenters/licences/communications.presenter.js'
import FetchLicenceService from './fetch-licence.service.js'
import FetchNotificationsDal from '../../dal/licences/fetch-notifications.dal.js'
import PaginatorPresenter from '../../presenters/paginator.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence communications page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence communication template.
 */
async function go(licenceId, auth, page) {
  const licence = await FetchLicenceService.go(licenceId)

  const { notifications, totalNumber } = await FetchNotificationsDal.go(licence.licenceRef, page)

  const pageData = CommunicationsPresenter.go(notifications, licence)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/licences/${licenceId}/communications`,
    notifications.length,
    'communications'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'communications',
    pagination,
    roles: userRoles(auth)
  }
}

export default {
  go
}
