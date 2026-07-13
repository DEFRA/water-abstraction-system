/**
 * Orchestrates fetching and presenting the data needed for `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 * @module VolumesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import VolumesPresenter from '../../../presenters/return-logs/setup/volumes.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for `/return-logs/setup/{sessionId}/volumes/{yearMonth}` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} yearMonth - The year and zero-indexed month to view, eg. `2014-0` for January 2014
 *
 * @returns {Promise<object>} The view data for the volumes page
 */
export default async function volumes(sessionId, yearMonth) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = VolumesPresenter(session, yearMonth)

  return {
    ...formattedData
  }
}
