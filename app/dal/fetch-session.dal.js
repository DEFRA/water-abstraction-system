'use strict'

/**
 * Fetches the session
 * @module FetchSessionDal
 */

const SessionModel = require('../models/session.model.js')
const SessionNotFoundError = require('../errors/session-not-found.error.js')

/**
 * Fetches the session
 *
 * @param {string} sessionId - The UUID of the session
 *
 * @returns {Promise<object[]>} an object containing the session
 * @throws {SessionNotFoundError} If no session is found with the provided session id
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
