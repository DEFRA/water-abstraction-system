/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/single-volume` page
 * @module SingleVolumeService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SingleVolumePresenter from '../../../presenters/return-logs/setup/single-volume.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/single-volume` page
 *
 * Supports generating the data needed for the single volume page in the return log setup journey. It fetches the
 * current session record and formats the data needed for the page.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The view data for the single volume page
 */
export default async function singleVolumeService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = SingleVolumePresenter(session)

  return {
    ...pageData
  }
}
