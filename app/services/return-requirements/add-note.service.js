'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/add-note` page
 * @module AddNoteService
 */
const AddNotePresenter = require('../../presenters/return-requirements/add-note.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/add-note` page
 *
 * Supports generating the data needed for the add-note page in the return requirements setup journey. It
 * fetches the current session record and combines it with textarea information needed for the form.
 *
 * @param {string} id - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} The view data for the add-note page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = AddNotePresenter.go(session)

  console.log('formattedData', formattedData)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.data.checkYourAnswersVisited,
    pageTitle: 'Add a note',
    ...formattedData
  }
}

module.exports = {
  go
}
