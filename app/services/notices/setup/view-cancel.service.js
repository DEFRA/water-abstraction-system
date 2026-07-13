/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/cancel` page
 * @module ViewCancelService
 */

import CancelPresenter from '../../../presenters/notices/setup/cancel.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates presenting the data for `/notices/setup/{sessionId}/cancel` page
 *
 * @param {string} sessionId - The UUID for the notice setup session record
 *
 * @returns {Promise<object>} The view data for the cancel page
 */
export default async function viewCancel(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const formattedData = CancelPresenter(session)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}
