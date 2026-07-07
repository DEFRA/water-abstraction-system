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
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = RecipientNamePresenter.go(session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

export default {
  go
}
