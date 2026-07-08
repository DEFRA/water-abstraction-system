/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @module ViewPaperReturnService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import PaperReturnPresenter from '../../../presenters/notices/setup/paper-return.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = PaperReturnPresenter(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
