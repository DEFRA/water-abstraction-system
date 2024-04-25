'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/delete-note` page
 * @module DeleteNoteService
 */

const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates removing note data for `/return-requirements/{sessionId}/check-your-answers` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * @param {string} sessionId - The id of the current session
 *
 * @returns {Promise<Object>} The page data for the no returns required page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session)

  return {
    notification: {
      titleText: 'Removed',
      text: 'Note removed'
    }
  }
}

async function _save (session) {
  const currentData = session.data

  currentData.note = ''

  return session.$query().patch({ data: currentData })
}

module.exports = {
  go
}
