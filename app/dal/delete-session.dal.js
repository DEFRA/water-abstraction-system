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
 * @param {object} [trx=null] - Optional transaction object
 */
async function go(sessionId, trx = null) {
  const query = trx ? SessionModel.query(trx) : SessionModel.query()

  await query.delete().where('id', sessionId)
}

module.exports = {
  go
}
