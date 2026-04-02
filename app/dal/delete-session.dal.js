'use strict'

/**
 * Deletes a session by its unique identifier.
 * @module DeleteSessionDal
 */

const SessionModel = require('../models/session.model.js')

/**
 * Deletes a session by its unique identifier.
 *
 * @param {string} sessionId - The UUID of the session to retrieve.
 */
async function go(sessionId) {
  await SessionModel.query().delete().where('id', sessionId)
}

module.exports = {
  go
}
