/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 * @module ViewPurposesService
 */

import FetchLicenceDal from '../../dal/licences/fetch-licence.dal.js'
import FetchPurposesService from '../licences/fetch-purposes.service.js'
import PurposesPresenter from '../../presenters/licences/purposes.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence purposes template
 */
export default async function viewPurposesService(licenceId, auth) {
  const licence = await FetchLicenceDal(licenceId)
  const purposes = await FetchPurposesService(licenceId)

  const pageData = PurposesPresenter(purposes, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'purposes',
    roles: userRoles(auth)
  }
}
