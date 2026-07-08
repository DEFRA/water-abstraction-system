/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @module ViewContactEmailService
 */

import ContactEmailPresenter from '../../../presenters/company-contacts/setup/contact-email.presenter.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the '/company-contacts/setup/{sessionId}/contact-email' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function go(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = ContactEmailPresenter.go(session)

  return {
    ...pageData
  }
}
