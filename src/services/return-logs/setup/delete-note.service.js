/**
 * Deletes the note from the return log currently being setup
 * @module DeleteNoteService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { flashNotification } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Deletes the note from the return log currently being setup
 *
 * It first retrieves the session instance for the return log journey in progress. Then it removes the notes
 * data from the session.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
export default async function deleteNoteService(sessionId, yar) {
  const session = await FetchSessionDal(sessionId)

  flashNotification(yar, 'Deleted', 'Note deleted')

  await _save(session)
}

async function _save(session) {
  delete session.note

  return session.$update()
}
