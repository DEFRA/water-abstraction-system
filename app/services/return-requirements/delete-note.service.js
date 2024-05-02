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
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} The page data for the check-your-answers page
 */
async function go (sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)
  const notification = {
    title: 'Removed',
    text: 'Note removed'
  }

  yar.flash('notification', notification)
  
  return _save(session)
}

async function _save (session) {
  const currentData = session.data

  currentData.note = ''

  return session.$query().patch({ data: currentData })
}

module.exports = {
  go
}
