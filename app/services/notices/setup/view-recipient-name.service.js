/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @module ViewRecipientNameService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import RecipientNamePresenter from '../../../presenters/notices/setup/recipient-name.presenter.js'

/**
 * Orchestrates fetching and presenting the data for the '/notices/setup/{sessionId}/recipient-name' page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function viewRecipientNameService(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = RecipientNamePresenter(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
