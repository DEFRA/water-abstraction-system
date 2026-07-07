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
async function go(licenceId, auth) {
  const licence = await FetchLicenceService.go(licenceId)
  const points = await FetchPointsService.go(licenceId)

  const pageData = PointsPresenter.go(points, licence)

  return {
    ...pageData,
    activeSecondaryNav: 'summary',
    activeSummarySubNav: 'points',
    roles: userRoles(auth)
  }
}

export {
  go
}
export default {
  go
}
