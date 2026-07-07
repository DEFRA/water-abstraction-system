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
async function go(sessionId, yearMonth) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = VolumesPresenter.go(session, yearMonth)

  return {
    ...formattedData
  }
}

export { go }
export default {
  go
}
