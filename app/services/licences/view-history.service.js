/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 * @module ViewHistoryService
 */

import FetchHistoryService from './fetch-history.service.js'
import FetchLicenceService from './fetch-licence.service.js'
import HistoryPresenter from '../../presenters/licences/history.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence history page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence history template.
 */
export default async function viewHistoryService(licenceId, auth) {
  const licence = await FetchLicenceService(licenceId)

  const licenceHistory = await FetchHistoryService(licenceId)

  const pageData = HistoryPresenter(licenceHistory, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'history',
    roles: userRoles(auth)
  }
}
