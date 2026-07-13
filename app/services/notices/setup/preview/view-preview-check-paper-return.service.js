/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-paper-return` page
 *
 * @module ViewPreviewCheckPaperReturnService
 */

import CheckPaperReturnPresenter from '../../../../presenters/notices/setup/preview/preview-check-paper-return.presenter.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'

/**
 * Orchestrates fetching and presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-paper-return` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} contactHashId - The recipients unique identifier
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function viewPreviewCheckPaperReturn(sessionId, contactHashId) {
  const session = await FetchSessionDal(sessionId)

  const pageData = CheckPaperReturnPresenter(session, contactHashId)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}
