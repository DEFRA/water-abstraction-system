/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 * @module ViewPointsService
 */

import FetchPointsService from '../licences/fetch-points.service.js'
import FetchLicenceService from './fetch-licence.service.js'
import PointsPresenter from '../../presenters/licences/points.presenter.js'
import { userRoles } from '../../presenters/licences/base-licences.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the licence points page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence points template
 */
export default async function (licenceId, auth) {
  const licence = await FetchLicenceService(licenceId)
  const points = await FetchPointsService(licenceId)

  const pageData = PointsPresenter(points, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'points',
    roles: userRoles(auth)
  }
}
