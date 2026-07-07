/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/contact-name' page
 *
 * @module ViewContactNameService
 */

import ContactNamePresenter from '../../../presenters/company-contacts/setup/contact-name.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/contact-name' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const pageData = ContactNamePresenter.go(session)

  return {
    ...pageData
  }
}

export default {
  go
}
