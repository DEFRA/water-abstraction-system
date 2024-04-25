'use strict'

/**
 * Orchestrates deleting the notes data for `/return-requirements/{sessionId}/check-your-answers` page
 * @module DeleteNoteService
 */

const SessionModel = require('../../models/session.model.js')

/**
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * Then it removes the notes data from the session.
 *
 * @param {string} sessionId - The id of the current session
 *
 * @returns {Promise<Object>} The page data for the check-your-answers page
 */
async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session)

  return {
    title: 'Removed',
    text: 'Note removed'
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
