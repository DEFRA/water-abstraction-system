/**
 * Orchestrates fetching and presenting the data for '/users/internal/setup/{sessionId}/email' page
 * @module ViewEmailService
 */

import EmailPresenter from '../../../../presenters/users/internal/setup/email.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for '/users/internal/setup/{sessionId}/email' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function viewEmail(sessionId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = EmailPresenter(session)

  return pageData
}
