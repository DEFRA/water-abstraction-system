'use strict'

/**
 * Deletes the note from the return log currently being setup
 * @module DeleteNoteService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const GeneralLib = require('../../../lib/general.lib.js')

/**
 * Deletes the note from the return log currently being setup
 *
 * It first retrieves the session instance for the return log journey in progress. Then it removes the notes
 * data from the session.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(sessionId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  GeneralLib.flashNotification(yar, 'Deleted', 'Note deleted')

  await _save(session)
}

async function _save(session) {
  delete session.note

  return session.$update()
}

module.exports = {
  go
}
