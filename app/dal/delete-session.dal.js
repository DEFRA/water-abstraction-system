/**
 * Deletes a session by its unique identifier.
 * @module DeleteSessionDal
 */

import SessionModel from '../models/session.model.js'

/**
 * Deletes a session by its unique identifier.
 *
 * @param {string} sessionId - The UUID of the session to delete.
 */
export default async function go(sessionId) {
  await SessionModel.query().delete().where('id', sessionId)
}
