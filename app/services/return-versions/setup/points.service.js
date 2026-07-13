/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/points` page
 * @module PointsService
 */

import FetchPointsService from './fetch-points.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import PointsPresenter from '../../../presenters/return-versions/setup/points.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/points` page
 *
 * Supports generating the data needed for the points page in the return requirements setup journey. It fetches the
 * current session record and combines it with the checkboxes and other information needed for the form.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Promise<object>} The view data for the points page
 */
export default async function (sessionId, requirementIndex) {
  const session = await FetchSessionDal(sessionId)
  const points = await FetchPointsService(session.licenceVersion.id)

  const formattedData = PointsPresenter(session, requirementIndex, points)

  return {
    ...formattedData
  }
}
