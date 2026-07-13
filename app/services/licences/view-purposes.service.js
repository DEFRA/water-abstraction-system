/**
 * Orchestrates fetching and presenting the data needed for the licence purposes page
 * @module ViewPurposesService
 */

import FetchPurposesService from '../licences/fetch-purposes.service.js'
import FetchLicenceService from './fetch-licence.service.js'
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
export default async function viewPurposes(licenceId, auth) {
  const licence = await FetchLicenceService(licenceId)
  const purposes = await FetchPurposesService(licenceId)

  const pageData = PurposesPresenter(purposes, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'purposes',
    roles: userRoles(auth)
  }
}
