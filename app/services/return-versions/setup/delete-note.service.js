'use strict'

/**
 * Deletes the note from the return version currently being setup
 * @module DeleteNoteService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Deletes the note from the return version currently being setup
 *
 * It first retrieves the session instance for the returns requirements journey in progress. Then it removes the notes
 * data from the session.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)
  const notification = {
    title: 'Deleted',
    text: 'Note deleted'
  }

  yar.flash('notification', notification)

  await _save(session)
}

async function _save(session) {
  delete session.note

  return session.$update()
}

module.exports = {
  go
}
