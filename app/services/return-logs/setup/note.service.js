/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/note` page
 * @module NoteService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import NotePresenter from '../../../presenters/return-logs/setup/note.presenter.js'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/note` page
 *
 * Supports generating the data needed for the note page in the return log setup journey. It fetches the
 * current session record and combines it with textarea information needed for the form.
 *
 * @param {string} sessionId - The UUID for return log setup session record
 *
 * @returns {Promise<object>} The view data for the note page
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const formattedData = NotePresenter.go(session)

  return {
    ...formattedData
  }
}

export default {
  go
}
