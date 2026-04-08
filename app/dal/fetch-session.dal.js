'use strict'

/**
 * Fetches a session by its unique identifier.
 * @module FetchSessionDal
 */

const SessionModel = require('../models/session.model.js')
const SessionNotFoundError = require('../errors/session-not-found.error.js')

/**
 * Fetches a session by its unique identifier.
 *
 * When the session does not exist, it throws a SessionNotFoundError. This is caught upstream and used to show the user
 * a specific error message related to the session being invalid, rather than the generic 'There's a problem with the service'.
 *
 * @param {string} sessionId - The UUID of the session to retrieve.
 *
 * @returns {Promise<object>} The session record found in the database.
 * @throws {SessionNotFoundError} If no session is found with the provided sessionId.
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  if (!session) {
    throw new SessionNotFoundError()
  }
  return session
}

module.exports = {
  go
}
