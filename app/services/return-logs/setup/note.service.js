'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-logs/setup/{sessionId}/note` page
 * @module NoteService
 */

const NotePresenter = require('../../../presenters/return-logs/setup/note.presenter.js')
const SessionModel = require('../../../models/session.model.js')

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
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = NotePresenter.go(session)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
