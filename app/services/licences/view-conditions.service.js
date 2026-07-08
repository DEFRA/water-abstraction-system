/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 * @module ViewConditionsService
 */

import ConditionsPresenter from '../../presenters/licences/conditions.presenter.js'
import FetchConditionsService from './fetch-conditions.service.js'
import FetchLicenceService from './fetch-licence.service.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence conditions page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence conditions template
 */
export default async function go(licenceId, auth) {
  const licence = await FetchLicenceService(licenceId)

  const currentLicenceVersion = licence.$currentVersion()

  const conditions = currentLicenceVersion ? await FetchConditionsService(currentLicenceVersion.id) : []

  const pageData = ConditionsPresenter(conditions, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'conditions',
    roles: userRoles(auth)
  }
}
