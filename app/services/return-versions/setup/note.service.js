'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/note` page
 * @module NoteService
 */

const NotePresenter = require('../../../presenters/return-versions/setup/note.presenter.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-versions/setup/{sessionId}/note` page
 *
 * Supports generating the data needed for the note page in the return requirements setup journey. It fetches the
 * current session record and combines it with textarea information needed for the form.
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<object>} The view data for the note page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const formattedData = NotePresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Add a note',
    ...formattedData
  }
}

module.exports = {
  go
}
